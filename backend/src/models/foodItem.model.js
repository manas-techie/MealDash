const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter food item name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter food item description"]
    },
    category: {
        type: String,
        required: [true, "Please enter food item category"]
    },
    price: {
        type: Number,
        required: [true, "Please enter food item price"]
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: [0, "Rating must be at least 0"],
                max: [5, "Rating must be at most 5"]
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("FoodItem", foodItemSchema);