const Stripe = require("stripe");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// GET STRIPE PUBLISHABLE KEY — so the frontend can init Stripe.js
exports.getStripeApiKey = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json(
        new ApiResponse(200, "Stripe API key fetched successfully", {
            stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY,
        })
    );
});


// CREATE STRIPE CHECKOUT SESSION
exports.createCheckoutSession = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    // 1. Get user's cart with populated food items
    const cart = await Cart.findOne({ user: userId }).populate(
        "items.foodItem",
        "name price stock isAvailable image"
    );

    if (!cart || cart.items.length === 0) {
        return next(new ErrorHandler("Your cart is empty", 400));
    }

    // 2. Validate all items
    for (const item of cart.items) {
        if (!item.foodItem) {
            return next(new ErrorHandler("A food item in your cart no longer exists", 400));
        }
        if (!item.foodItem.isAvailable) {
            return next(new ErrorHandler(`"${item.foodItem.name}" is currently unavailable`, 400));
        }
        if (item.foodItem.stock < item.quantity) {
            return next(
                new ErrorHandler(
                    `Insufficient stock for "${item.foodItem.name}". Available: ${item.foodItem.stock}, Requested: ${item.quantity}`,
                    400
                )
            );
        }
    }

    // 3. Validate delivery info from request body
    const { deliveryInfo, taxAmount, deliveryCharge } = req.body;

    if (
        !deliveryInfo || !deliveryInfo.address || !deliveryInfo.city ||
        !deliveryInfo.state || !deliveryInfo.pinCode || !deliveryInfo.phoneNumber ||
        !deliveryInfo.country || !deliveryInfo.deliveryTime || !deliveryInfo.deliveryDate
    ) {
        return next(new ErrorHandler("Please provide complete delivery information", 400));
    }

    if (taxAmount === undefined || deliveryCharge === undefined) {
        return next(new ErrorHandler("Please provide tax amount and delivery charge", 400));
    }

    // 4. Build Stripe line items from cart
    const lineItems = cart.items.map((item) => ({
        price_data: {
            currency: "inr",
            product_data: {
                name: item.foodItem.name,
                ...(item.foodItem.image && { images: [item.foodItem.image] }),
            },
            unit_amount: Math.round(item.foodItem.price * 100), // Stripe expects paise
        },
        quantity: item.quantity,
    }));

    // Add tax as a line item
    if (Number(taxAmount) > 0) {
        lineItems.push({
            price_data: {
                currency: "inr",
                product_data: { name: "Tax" },
                unit_amount: Math.round(Number(taxAmount) * 100),
            },
            quantity: 1,
        });
    }

    // Add delivery charge as a line item
    if (Number(deliveryCharge) > 0) {
        lineItems.push({
            price_data: {
                currency: "inr",
                product_data: { name: "Delivery Charge" },
                unit_amount: Math.round(Number(deliveryCharge) * 100),
            },
            quantity: 1,
        });
    }

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        customer_email: req.user.email,
        metadata: {
            userId: userId.toString(),
            cartId: cart._id.toString(),
            restaurantId: cart.restaurant.toString(),
            deliveryInfo: JSON.stringify(deliveryInfo),
            taxAmount: String(taxAmount),
            deliveryCharge: String(deliveryCharge),
        },
        success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.status(200).json(
        new ApiResponse(200, "Checkout session created successfully", {
            url: session.url,
            sessionId: session.id,
        })
    );
});


// STRIPE WEBHOOK — handles checkout.session.completed
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // raw body (Buffer)
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("⚠️  Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        try {
            await handleSuccessfulPayment(session);
        } catch (err) {
            console.error("❌ Error processing successful payment:", err);
            // Still return 200 so Stripe doesn't retry, but log the error
            return res.status(200).json({ received: true, error: err.message });
        }
    }

    res.status(200).json({ received: true });
};


// Helper: process a successful payment
async function handleSuccessfulPayment(session) {
    const { userId, cartId, restaurantId, deliveryInfo, taxAmount, deliveryCharge } =
        session.metadata;

    // Check if order already exists for this session (idempotency)
    const existingOrder = await Order.findOne({ "paymentInfo.sessionId": session.id });
    if (existingOrder) {
        console.log(`Order already exists for session ${session.id}, skipping.`);
        return;
    }

    // Get the cart
    const cart = await Cart.findById(cartId).populate("items.foodItem", "name price stock isAvailable");

    if (!cart || cart.items.length === 0) {
        throw new Error(`Cart ${cartId} is empty or not found for session ${session.id}`);
    }

    // Calculate total
    const parsedDeliveryInfo = JSON.parse(deliveryInfo);
    const parsedTaxAmount = Number(taxAmount);
    const parsedDeliveryCharge = Number(deliveryCharge);

    const itemsSubtotal = cart.items.reduce(
        (sum, item) => sum + item.foodItem.price * item.quantity,
        0
    );
    const totalAmount = itemsSubtotal + parsedTaxAmount + parsedDeliveryCharge;

    // Build order items
    const orderItems = cart.items.map((item) => ({
        foodItem: item.foodItem._id,
        quantity: item.quantity,
    }));

    // Create the order (pre-save hook handles stock decrement)
    await Order.create({
        user: userId,
        restaurant: restaurantId,
        items: orderItems,
        deliveryInfo: parsedDeliveryInfo,
        paymentInfo: {
            id: session.payment_intent,
            sessionId: session.id,
            status: "completed",
            method: "stripe",
            amount: totalAmount,
        },
        taxAmount: parsedTaxAmount,
        deliveryCharge: parsedDeliveryCharge,
        totalAmount,
    });

    // Clear the cart
    await Cart.findByIdAndDelete(cartId);

    console.log(`✅ Order created for session ${session.id}`);
}
