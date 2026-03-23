const Restaurant = require("../models/restaurant.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");
const ApiFeatures = require("../utils/apiFeatures");

// Whitelist of fields that can be set/updated by the user
const ALLOWED_FIELDS = [
    "name",
    "description",
    "address",
    "location",
    "isVegetarian",
    "openingHours",
    "images",
];

/**
 * Pick only allowed fields from an object.
 * Prevents mass-assignment attacks (e.g. injecting rating, reviews, owner).
 */
const pickAllowedFields = (body, allowedFields) => {
    const filtered = {};
    allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
            filtered[field] = body[field];
        }
    });
    return filtered;
};


// ─── GET ALL RESTAURANTS (Public) ────────────────────────────────────────────
exports.getAllRestaurants = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 12;

    // Count total before pagination for frontend pagination controls
    const totalRestaurants = await Restaurant.countDocuments();

    const apiFeatures = new ApiFeatures(Restaurant.find(), req.query)
        .search()
        .sort()
        .pagination(resPerPage);

    const restaurants = await apiFeatures.query.lean();

    res.status(200).json(
        new ApiResponse(200, "Restaurants fetched successfully", {
            totalRestaurants,
            resPerPage,
            restaurants,
        })
    );
});


// ─── GET RESTAURANT DETAILS (Public) ─────────────────────────────────────────
exports.getRestaurantDetails = catchAsyncErrors(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id)
        .populate("owner", "name email")
        .lean();

    if (!restaurant) {
        return next(new ErrorHandler(404, "Restaurant not found"));
    }

    res.status(200).json(
        new ApiResponse(200, "Restaurant details fetched successfully", { restaurant })
    );
});


// ─── CREATE RESTAURANT (restaurant-owner / admin) ────────────────────────────
exports.createRestaurant = catchAsyncErrors(async (req, res, next) => {
    const filteredBody = pickAllowedFields(req.body, ALLOWED_FIELDS);

    // Validate required fields
    const { name, description, address, location } = filteredBody;
    if (!name || !description || !address || !location) {
        return next(new ErrorHandler(400, "Please enter all required fields (name, description, address, location)"));
    }

    // Attach the authenticated user as the owner
    filteredBody.owner = req.user._id;

    const restaurant = await Restaurant.create(filteredBody);

    res.status(201).json(
        new ApiResponse(201, "Restaurant created successfully", { restaurant })
    );
});


// ─── UPDATE RESTAURANT (owner of that restaurant / admin) ────────────────────
exports.updateRestaurant = catchAsyncErrors(async (req, res, next) => {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new ErrorHandler(404, "Restaurant not found"));
    }

    // Ownership check: only the owner or an admin can update
    if (
        restaurant.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        return next(
            new ErrorHandler(403, "You are not authorized to update this restaurant")
        );
    }

    const filteredBody = pickAllowedFields(req.body, ALLOWED_FIELDS);

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json(
        new ApiResponse(200, "Restaurant updated successfully", { restaurant })
    );
});


// ─── DELETE RESTAURANT (owner of that restaurant / admin) ────────────────────
exports.deleteRestaurant = catchAsyncErrors(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new ErrorHandler(404, "Restaurant not found"));
    }

    // Ownership check: only the owner or an admin can delete
    if (
        restaurant.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        return next(
            new ErrorHandler(403, "You are not authorized to delete this restaurant")
        );
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.status(200).json(
        new ApiResponse(200, "Restaurant deleted successfully")
    );
});