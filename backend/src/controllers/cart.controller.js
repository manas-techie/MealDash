const Cart = require("../models/cart.model");
const FoodItem = require("../models/foodItem.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");


// GET CART (authenticated user)
exports.getCart = catchAsyncErrors(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.foodItem", "name image isAvailable")
        .populate("restaurant", "name");

    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, "Cart is empty", {
                cart: null,
                totalPrice: 0,
            })
        );
    }

    res.status(200).json(
        new ApiResponse(200, "Cart fetched successfully", {
            cart,
            totalPrice: cart.totalPrice,
        })
    );
});


// ADD ITEM TO CART (authenticated user)
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
    const { foodItemId, quantity = 1 } = req.body;

    if (!foodItemId) {
        return next(new ErrorHandler("Please provide foodItemId", 400));
    }

    if (quantity < 1) {
        return next(new ErrorHandler("Quantity must be at least 1", 400));
    }

    // Verify food item exists and is available
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
        return next(new ErrorHandler("Food item not found", 404));
    }
    if (!foodItem.isAvailable) {
        return next(new ErrorHandler("This food item is currently unavailable", 400));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        // Cart exists — check if it's from the same restaurant
        if (cart.restaurant.toString() !== foodItem.restaurant.toString()) {
            // Different restaurant — clear cart and start fresh
            cart.items = [];
            cart.restaurant = foodItem.restaurant;
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(
            (item) => item.foodItem.toString() === foodItemId
        );

        if (existingItem) {
            // Increase quantity
            existingItem.quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                foodItem: foodItemId,
                quantity,
                price: foodItem.price,
            });
        }

        await cart.save();
    } else {
        // No cart — create one
        cart = await Cart.create({
            user: req.user._id,
            restaurant: foodItem.restaurant,
            items: [
                {
                    foodItem: foodItemId,
                    quantity,
                    price: foodItem.price,
                },
            ],
        });
    }

    await cart.populate("items.foodItem", "name image isAvailable");
    await cart.populate("restaurant", "name");

    res.status(200).json(
        new ApiResponse(200, "Item added to cart", {
            cart,
            totalPrice: cart.totalPrice,
        })
    );
});


// UPDATE ITEM QUANTITY (authenticated user)
exports.updateCartItem = catchAsyncErrors(async (req, res, next) => {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity === undefined || quantity < 0) {
        return next(new ErrorHandler("Please provide a valid quantity (0 or more)", 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new ErrorHandler("Cart not found", 404));
    }

    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
        return next(new ErrorHandler("Item not found in cart", 404));
    }

    if (quantity === 0) {
        // Remove item from cart
        cart.items.pull(itemId);
    } else {
        cartItem.quantity = quantity;
    }

    // If cart is empty after removal, delete the cart
    if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cart._id);
        return res.status(200).json(
            new ApiResponse(200, "Cart is now empty", {
                cart: null,
                totalPrice: 0,
            })
        );
    }

    await cart.save();
    await cart.populate("items.foodItem", "name image isAvailable");
    await cart.populate("restaurant", "name");

    res.status(200).json(
        new ApiResponse(200, "Cart updated successfully", {
            cart,
            totalPrice: cart.totalPrice,
        })
    );
});


// REMOVE ITEM FROM CART (authenticated user)
exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new ErrorHandler("Cart not found", 404));
    }

    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
        return next(new ErrorHandler("Item not found in cart", 404));
    }

    cart.items.pull(itemId);

    // If cart is empty after removal, delete the cart
    if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cart._id);
        return res.status(200).json(
            new ApiResponse(200, "Cart is now empty", {
                cart: null,
                totalPrice: 0,
            })
        );
    }

    await cart.save();
    await cart.populate("items.foodItem", "name image isAvailable");
    await cart.populate("restaurant", "name");

    res.status(200).json(
        new ApiResponse(200, "Item removed from cart", {
            cart,
            totalPrice: cart.totalPrice,
        })
    );
});


// CLEAR CART (authenticated user)
exports.clearCart = catchAsyncErrors(async (req, res, next) => {
    const cart = await Cart.findOneAndDelete({ user: req.user._id });

    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, "Cart is already empty", {
                cart: null,
                totalPrice: 0,
            })
        );
    }

    res.status(200).json(
        new ApiResponse(200, "Cart cleared successfully", {
            cart: null,
            totalPrice: 0,
        })
    );
});
