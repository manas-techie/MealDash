const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    menu: [
        {
            category: {
                type: String,
            },
            items: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "FoodItem"
                }
            ]
        }
    ],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: [true, "Menu must belong to a restaurant"]
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// menuSchema.pre(/^find/, function (next) {
//     this.populate("menu.items");
//     next();
// });

module.exports = mongoose.model("Menu", menuSchema);