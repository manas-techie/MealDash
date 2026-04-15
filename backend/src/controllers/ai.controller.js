const Restaurant = require("../models/restaurant.model");
const FoodItem = require("../models/foodItem.model");
const { generateDishDescription } = require("../services/ai.service");
const { generateReviewSummary } = require("../services/aiReviewAnalyzer.service");
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

exports.generateRestaurantReviewSummary = catchAsyncErrors(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id).lean();

    if (!restaurant) {
        return next(new ErrorHandler("Restaurant not found", 404));
    }

    const reviews = Array.isArray(restaurant.reviews) ? restaurant.reviews : [];

    if (reviews.length < 2) {
        return res.status(200).json(
            new ApiResponse(200, "Restaurant review summary generated successfully", {
                summary: {
                    text: "Not enough reviews yet to generate a reliable summary.",
                    totalReviews: reviews.length,
                    averageRating: Number(restaurant.rating || 0).toFixed(1),
                    generatedAt: new Date().toISOString(),
                },
            })
        );
    }

    if (!process.env.GROQ_API_KEY) {
        return next(new ErrorHandler("AI service is not configured on server", 500));
    }

    const summaryText = await generateReviewSummary({
        entityType: "restaurant",
        entityName: restaurant.name,
        averageRating: restaurant.rating,
        totalReviews: reviews.length,
        reviews,
    });

    if (!summaryText) {
        return next(new ErrorHandler("AI could not generate a valid review summary", 502));
    }

    res.status(200).json(
        new ApiResponse(200, "Restaurant review summary generated successfully", {
            summary: {
                text: summaryText,
                totalReviews: reviews.length,
                averageRating: Number(restaurant.rating || 0).toFixed(1),
                generatedAt: new Date().toISOString(),
            },
        })
    );
});

exports.generateFoodItemReviewSummary = catchAsyncErrors(async (req, res, next) => {
    const { restaurantId, id } = req.params;

    const foodItem = await FoodItem.findOne({
        _id: id,
        restaurant: restaurantId,
    }).lean();

    if (!foodItem) {
        return next(new ErrorHandler("Food item not found", 404));
    }

    const reviews = Array.isArray(foodItem.reviews) ? foodItem.reviews : [];
    const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
        : 0;

    if (reviews.length < 2) {
        return res.status(200).json(
            new ApiResponse(200, "Food item review summary generated successfully", {
                summary: {
                    text: "Not enough reviews yet to generate a reliable summary.",
                    totalReviews: reviews.length,
                    averageRating: Number(averageRating || 0).toFixed(1),
                    generatedAt: new Date().toISOString(),
                },
            })
        );
    }

    if (!process.env.GROQ_API_KEY) {
        return next(new ErrorHandler("AI service is not configured on server", 500));
    }

    const summaryText = await generateReviewSummary({
        entityType: "food item",
        entityName: foodItem.name,
        averageRating,
        totalReviews: reviews.length,
        reviews,
    });

    if (!summaryText) {
        return next(new ErrorHandler("AI could not generate a valid review summary", 502));
    }

    res.status(200).json(
        new ApiResponse(200, "Food item review summary generated successfully", {
            summary: {
                text: summaryText,
                totalReviews: reviews.length,
                averageRating: Number(averageRating || 0).toFixed(1),
                generatedAt: new Date().toISOString(),
            },
        })
    );
});
