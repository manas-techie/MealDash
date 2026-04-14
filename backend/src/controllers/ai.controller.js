const Restaurant = require("../models/restaurant.model");
const { generateDishDescription } = require("../../services/ai.service");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");

exports.generateFoodItemDescription = catchAsyncErrors(async (req, res, next) => {
    const { restaurantId } = req.params;
    const { name, category, spiceLevel, price } = req.body || {};

    if (!name || !String(name).trim()) {
        return next(new ErrorHandler("Food item name is required", 400));
    }

    if (!category || !String(category).trim()) {
        return next(new ErrorHandler("Food item category is required", 400));
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return next(new ErrorHandler("Please provide a valid non-negative price", 400));
    }

    if (!process.env.GROQ_API_KEY) {
        return next(new ErrorHandler("AI service is not configured on server", 500));
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
        return next(new ErrorHandler("Restaurant not found", 404));
    }

    if (
        restaurant.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        return next(new ErrorHandler("You are not authorized to generate descriptions for this restaurant", 403));
    }

    const generated = await generateDishDescription({
        name: String(name).trim(),
        category: String(category).trim(),
        spiceLevel: String(spiceLevel || "medium").trim(),
        price: parsedPrice,
    });

    const descriptionData = {
        description: String(generated?.description || "").trim(),
        tags: Array.isArray(generated?.tags) ? generated.tags : [],
        allergens: Array.isArray(generated?.allergens) ? generated.allergens : [],
        serves: generated?.serves ? String(generated.serves) : "1",
        bestFor: Array.isArray(generated?.bestFor) ? generated.bestFor : [],
    };

    if (!descriptionData.description) {
        return next(new ErrorHandler("AI could not generate a valid description", 502));
    }

    res.status(200).json(
        new ApiResponse(200, "Food item description generated successfully", {
            descriptionData,
        })
    );
});
