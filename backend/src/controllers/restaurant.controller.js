const Restaurant = require("../models/restaurant.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");
const APIFeatures = require("../utils/apiFeatures");

// Featch all restaurants
exports.getAllRestaurants = catchAsyncErrors(async (req, res, next) => {
    const apiFeatures = new APIFeatures(Restaurant.find(), req.query)
        .search()
        .sort()

    const restaurants = await apiFeatures.query;

    res.status(200)
        .json(
            new ApiResponse(200, "Restaurants fetched successfully", { restaurants })
        )
});

// creating a restaurant
exports.createRestaurant = catchAsyncErrors(async (req, res, next) => {
    const { name, description, address, location, ...rest } = req.body;

    if (!name || !description || !address || !location) {
        return next(new ErrorHandler(400, "Please enter all required fields"));
    }

    const restaurant = await Restaurant.create({
        name,
        description,
        address,
        location,
        ...rest,
    });

    res.status(201)
        .json(
            new ApiResponse(201, "Restaurant created successfully", { restaurant })
        )
});

// Get restaurant details
exports.getRestaurantDetails = catchAsyncErrors(async (req, res, next) => {
    const restaurantId = req.params.id;
    if (!restaurantId) {
        return next(new ErrorHandler(400, "Restaurant ID is required"));
    }
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return next(new ErrorHandler(404, "Restaurant not found"));
    }

    res.status(200)
        .json(
            new ApiResponse(200, "Restaurant details fetched successfully", { restaurant })
        )
});

// delete restaurant
exports.deleteRestaurant = catchAsyncErrors(async (req, res, next) => {
    const restaurantId = req.params.id;
    if (!restaurantId) {
        return next(new ErrorHandler(400, "Restaurant ID is required"));
    }
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return next(new ErrorHandler(404, "Restaurant not found"));
    }

    await restaurant.remove();

    res.status(204)
        .json(
            new ApiResponse(204, "Restaurant deleted successfully")
        )
});