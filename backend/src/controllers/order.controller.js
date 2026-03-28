const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const FoodItem = require("../models/foodItem.model");
const Restaurant = require("../models/restaurant.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");


// PLACE ORDER — from user's cart (authenticated user)
exports.placeOrder = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    // 1. Get the user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.foodItem", "name price stock isAvailable");

    if (!cart || cart.items.length === 0) {
        return next(new ErrorHandler("Your cart is empty", 400));
    }

    // 2. Validate all items are available and in stock
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

    // 3. Validate delivery info & payment info from request body
    const { deliveryInfo, paymentInfo, taxAmount, deliveryCharge } = req.body;

    if (!deliveryInfo || !deliveryInfo.address || !deliveryInfo.city || !deliveryInfo.state ||
        !deliveryInfo.pinCode || !deliveryInfo.phoneNumber || !deliveryInfo.country ||
        !deliveryInfo.deliveryTime || !deliveryInfo.deliveryDate) {
        return next(new ErrorHandler("Please provide complete delivery information", 400));
    }

    if (!paymentInfo || !paymentInfo.id || !paymentInfo.status || !paymentInfo.method) {
        return next(new ErrorHandler("Please provide complete payment information", 400));
    }

    if (taxAmount === undefined || deliveryCharge === undefined) {
        return next(new ErrorHandler("Please provide tax amount and delivery charge", 400));
    }

    // 4. Calculate totals
    const itemsSubtotal = cart.items.reduce(
        (sum, item) => sum + item.foodItem.price * item.quantity,
        0
    );
    const totalAmount = itemsSubtotal + Number(taxAmount) + Number(deliveryCharge);

    // 5. Build order items (snapshot the quantity; stock is decremented by pre-save hook)
    const orderItems = cart.items.map((item) => ({
        foodItem: item.foodItem._id,
        quantity: item.quantity,
    }));

    // 6. Create order (pre-save hook handles stock decrement)
    const order = await Order.create({
        user: userId,
        restaurant: cart.restaurant,
        items: orderItems,
        deliveryInfo,
        paymentInfo: {
            id: paymentInfo.id,
            status: paymentInfo.status,
            method: paymentInfo.method,
            amount: totalAmount,
        },
        taxAmount: Number(taxAmount),
        deliveryCharge: Number(deliveryCharge),
        totalAmount,
    });

    // 7. Clear the cart after successful order
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json(
        new ApiResponse(201, "Order placed successfully", { order })
    );
});


// GET MY ORDERS (authenticated user)
exports.getMyOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
        .populate("restaurant", "name")
        .populate("items.foodItem", "name price image")
        .sort({ createdAt: -1 })
        .lean()
        .exec();

    res.status(200).json(
        new ApiResponse(200, "Orders fetched successfully", {
            totalOrders: orders.length,
            orders,
        })
    );
});


// GET SINGLE ORDER DETAILS (authenticated user — own order, or admin)
exports.getOrderDetails = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name email")
        .populate("restaurant", "name")
        .populate("items.foodItem", "name price image")
        .lean()
        .exec();

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    // Only the order owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return next(new ErrorHandler("You are not authorized to view this order", 403));
    }

    res.status(200).json(
        new ApiResponse(200, "Order fetched successfully", { order })
    );
});


// UPDATE ORDER STATUS (restaurant-owner / admin)
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    // Verify the user owns the restaurant or is admin
    if (req.user.role !== "admin") {
        const restaurant = await Restaurant.findById(order.restaurant);
        if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
            return next(new ErrorHandler("You are not authorized to update this order", 403));
        }
    }

    const { status } = req.body;
    const validStatuses = ["processing", "out for delivery", "delivered", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
        return next(
            new ErrorHandler(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400)
        );
    }

    // Prevent updating a delivered or cancelled order
    if (order.orderStatus === "delivered") {
        return next(new ErrorHandler("This order has already been delivered", 400));
    }
    if (order.orderStatus === "cancelled") {
        return next(new ErrorHandler("This order has already been cancelled", 400));
    }

    // If cancelling, restore stock
    if (status === "cancelled") {
        for (const item of order.items) {
            const foodItem = await FoodItem.findById(item.foodItem);
            if (foodItem) {
                foodItem.stock += item.quantity;
                foodItem.isAvailable = true;
                await foodItem.save();
            }
        }
        order.paymentInfo.status = "cancelled";
    }

    // If delivered, mark payment as completed
    if (status === "delivered") {
        order.paymentInfo.status = "completed";
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json(
        new ApiResponse(200, `Order status updated to "${status}"`, { order })
    );
});


// CANCEL ORDER (authenticated user — own order only, within processing stage)
exports.cancelOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    // Only order owner can cancel
    if (order.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to cancel this order", 403));
    }

    if (order.orderStatus !== "processing") {
        return next(
            new ErrorHandler("Order can only be cancelled while it is still processing", 400)
        );
    }

    // Restore stock
    for (const item of order.items) {
        const foodItem = await FoodItem.findById(item.foodItem);
        if (foodItem) {
            foodItem.stock += item.quantity;
            foodItem.isAvailable = true;
            await foodItem.save();
        }
    }

    order.orderStatus = "cancelled";
    order.paymentInfo.status = "cancelled";
    await order.save();

    res.status(200).json(
        new ApiResponse(200, "Order cancelled successfully", { order })
    );
});


// GET RESTAURANT ORDERS (restaurant-owner — orders for their restaurant)
exports.getRestaurantOrders = catchAsyncErrors(async (req, res, next) => {
    const { restaurantId } = req.params;

    // Verify ownership
    if (req.user.role !== "admin") {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return next(new ErrorHandler("Restaurant not found", 404));
        }
        if (restaurant.owner.toString() !== req.user._id.toString()) {
            return next(new ErrorHandler("You are not authorized to view these orders", 403));
        }
    }

    // Optional status filter
    const filter = { restaurant: restaurantId };
    if (req.query.status) {
        filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
        .populate("user", "name email")
        .populate("items.foodItem", "name price image")
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json(
        new ApiResponse(200, "Restaurant orders fetched successfully", {
            totalOrders: orders.length,
            orders,
        })
    );
});


// GET ALL ORDERS (admin only)
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    // Optional status filter
    const filter = {};
    if (req.query.status) {
        filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
        .populate("user", "name email")
        .populate("restaurant", "name")
        .populate("items.foodItem", "name price")
        .sort({ createdAt: -1 })
        .lean();

    // Calculate total revenue from delivered orders
    const totalRevenue = orders
        .filter((o) => o.orderStatus === "delivered")
        .reduce((sum, o) => sum + o.totalAmount, 0);

    res.status(200).json(
        new ApiResponse(200, "All orders fetched successfully", {
            totalOrders: orders.length,
            totalRevenue,
            orders,
        })
    );
});
