const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    items: [
        {
            foodItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FoodItem",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    deliveryInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pinCode: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        deliveryTime: {
            type: String,
            required: true,
        },
        deliveryDate: {
            type: String,
            required: true,
        },
    },
    paymentInfo: {
        id: {
            type: String,
            required: true,
        },
        sessionId: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled", "refunded"],
            required: true,
        },
        method: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    orderStatus: {
        type: String,
        enum: ["processing", "out for delivery", "delivered", "cancelled"],
        default: "processing",
    },
    taxAmount: {
        type: Number,
        required: true,
    },
    deliveryCharge: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

//stock management — only decrement on new order creation
orderSchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    try {
        for (const item of this.items) {
            const foodItem = await mongoose.model("FoodItem").findById(item.foodItem);
            if (!foodItem) {
                return next(new ErrorHandler(`Food item ${item.foodItem} not found`, 404));
            }
            if (foodItem.stock < item.quantity) {
                return next(
                    new ErrorHandler(`Insufficient stock for "${foodItem.name}". Available: ${foodItem.stock}, Requested: ${item.quantity}`, 400)
                );
            }
            foodItem.stock -= item.quantity;
            foodItem.isAvailable = foodItem.stock > 0;
            await foodItem.save();
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("Order", orderSchema);