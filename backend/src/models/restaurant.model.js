const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Restaurant must have an owner"],
    },
    name: {
        type: String,
        required: [true, "Please enter restaurant name"],
        trim: true,
        maxLength: [100, "Restaurant name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Please enter restaurant description"],
        maxLength: [200, "Restaurant description cannot exceed 200 characters"],
    },
    isVegetarian: {
        type: Boolean,
        default: false,
    },
    address: {
        type: String,
        required: [true, "Please enter restaurant address"],
    },
    openingHours: {
        type: String,
        required: [true, "Please enter opening hours"],
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        required: [true, "Please enter restaurant location"]
    },
    noOfReviews: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be less than 0"],
        max: [5, "Rating cannot be more than 5"],
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                min: [0, "Rating cannot be less than 0"],
                max: [5, "Rating cannot be more than 5"],
            },
            comment: {
                type: String,
                required: true,
            },
        }
    ],
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ]
}, { timestamps: true });


restaurantSchema.index({ location: "2dsphere" });
restaurantSchema.index({ address: "text" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
