const Restaurant = require("../models/restaurant.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");
const ApiFeatures = require("../utils/apiFeatures");
const { uploadOnCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

// Whitelist of fields that can be set/updated by the user
const ALLOWED_FIELDS = [
    "name",
    "description",
    "address",
    "location",
    "isVegetarian",
    "openingHours",
];

// Pick only allowed fields from an object.
// Prevents mass-assignment attacks (e.g. injecting rating, reviews, owner).
const pickAllowedFields = (body, allowedFields) => {
    const filtered = {};
    allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
            filtered[field] = body[field];
        }
    });
    return filtered;
};


// GET ALL RESTAURANTS (Public)
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
            totalRestaurants: totalRestaurants,
            resPerPage: resPerPage,
            restaurants: restaurants,
        })
    );
});


// GET RESTAURANT DETAILS (Public)
exports.getRestaurantDetails = catchAsyncErrors(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id)
        .populate("owner", "name email")
        .lean();

    if (!restaurant) {
        return next(new ErrorHandler("Restaurant not found", 404));
    }

    res.status(200).json(
        new ApiResponse(200, "Restaurant details fetched successfully", { restaurant })
    );
});


// CREATE RESTAURANT (restaurant-owner / admin)
exports.createRestaurant = catchAsyncErrors(async (req, res, next) => {
    const filteredBody = pickAllowedFields(req.body, ALLOWED_FIELDS);

    // form-data sends location as a string — parse it
    if (typeof filteredBody.location === "string") {
        try {
            filteredBody.location = JSON.parse(filteredBody.location);
        } catch (e) {
            return next(new ErrorHandler("Invalid location format. Must be valid JSON", 400));
        }
    }

    // Validate required fields
    const { name, description, address, location } = filteredBody;
    if (!name || !description || !address || !location) {
        return next(new ErrorHandler("Please enter all required fields (name, description, address, location)", 400));
    }

    // Attach the authenticated user as the owner
    filteredBody.owner = req.user._id;

    // Upload images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
        const uploadedImages = [];
        for (const file of req.files) {
            const result = await uploadOnCloudinary(file.path, "mealdash/restaurants");
            if (result) {
                uploadedImages.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        }
        filteredBody.images = uploadedImages;
    }

    const restaurant = await Restaurant.create(filteredBody);

    res.status(201).json(
        new ApiResponse(201, "Restaurant created successfully", { restaurant })
    );
});


// UPDATE RESTAURANT (owner of that restaurant / admin)
exports.updateRestaurant = catchAsyncErrors(async (req, res, next) => {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new ErrorHandler("Restaurant not found", 404));
    }

    // Ownership check: only the owner or an admin can update
    if (
        restaurant.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        return next(
            new ErrorHandler("You are not authorized to update this restaurant", 403)
        );
    }

    const filteredBody = pickAllowedFields(req.body, ALLOWED_FIELDS);

    // form-data sends location as a string — parse it
    if (typeof filteredBody.location === "string") {
        try {
            filteredBody.location = JSON.parse(filteredBody.location);
        } catch (e) {
            return next(new ErrorHandler("Invalid location format. Must be valid JSON", 400));
        }
    }

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
        // Delete old images from Cloudinary
        if (restaurant.images && restaurant.images.length > 0) {
            for (const img of restaurant.images) {
                await deleteFromCloudinary(img.public_id);
            }
        }

        // Upload new images
        const uploadedImages = [];
        for (const file of req.files) {
            const result = await uploadOnCloudinary(file.path, "mealdash/restaurants");
            if (result) {
                uploadedImages.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        }
        filteredBody.images = uploadedImages;
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json(
        new ApiResponse(200, "Restaurant updated successfully", { restaurant })
    );
});


// DELETE RESTAURANT (owner of that restaurant / admin)
exports.deleteRestaurant = catchAsyncErrors(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new ErrorHandler("Restaurant not found", 404));
    }

    // Ownership check: only the owner or an admin can delete
    if (
        restaurant.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        return next(
            new ErrorHandler("You are not authorized to delete this restaurant", 403)
        );
    }

    // Delete images from Cloudinary before removing the restaurant
    if (restaurant.images && restaurant.images.length > 0) {
        for (const img of restaurant.images) {
            await deleteFromCloudinary(img.public_id);
        }
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.status(200).json(
        new ApiResponse(200, "Restaurant deleted successfully")
    );
});