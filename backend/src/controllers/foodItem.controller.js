const FoodItem = require("../models/foodItem.model");
const Menu = require("../models/menu.model");
const Restaurant = require("../models/restaurant.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");
const { uploadOnCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

// Whitelist of fields that can be set/updated (image handled separately via file upload)
const ALLOWED_FIELDS = [
    "name",
    "description",
    "category",
    "price",
    "isAvailable",
    "stock",
];

const pickAllowedFields = (body, allowedFields) => {
    const filtered = {};
    allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
            filtered[field] = body[field];
        }
    });
    return filtered;
};


//  verify restaurant ownership.
//  Returns the restaurant if authorized, or calls next() with error.

const verifyRestaurantOwnership = async (restaurantId, user, next) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        next(new ErrorHandler("Restaurant not found", 404));
        return null;
    }
    if (
        restaurant.owner.toString() !== user._id.toString() &&
        user.role !== "admin"
    ) {
        next(new ErrorHandler("You are not authorized to manage food items for this restaurant", 403));
        return null;
    }
    return restaurant;
};


// GET ALL FOOD ITEMS FOR A RESTAURANT (Public)
exports.getAllFoodItems = catchAsyncErrors(async (req, res, next) => {
    const { restaurantId } = req.params;

    const filter = { restaurant: restaurantId };

    // Optional query filters
    if (req.query.category) {
        filter.category = req.query.category;
    }
    if (req.query.isAvailable !== undefined) {
        filter.isAvailable = req.query.isAvailable === "true";
    }

    const foodItems = await FoodItem.find(filter).lean();

    res.status(200).json(
        new ApiResponse(200, "Food items fetched successfully", {
            totalItems: foodItems.length,
            foodItems,
        })
    );
});


// GET SINGLE FOOD ITEM (Public)
exports.getFoodItemDetails = catchAsyncErrors(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.id)
        .populate("menu", "menu")
        .populate("restaurant", "name")
        .lean();

    if (!foodItem) {
        return next(new ErrorHandler("Food item not found", 404));
    }

    res.status(200).json(
        new ApiResponse(200, "Food item fetched successfully", { foodItem })
    );
});


// CREATE FOOD ITEM (restaurant-owner / admin)
exports.createFoodItem = catchAsyncErrors(async (req, res, next) => {
    const { restaurantId } = req.params;

    // Verify ownership
    const restaurant = await verifyRestaurantOwnership(restaurantId, req.user, next);
    if (!restaurant) return;

    const filteredBody = pickAllowedFields(req.body, ALLOWED_FIELDS);

    const { name, description, category, price, stock } = filteredBody;
    if (!name || !description || !category || price === undefined || stock === undefined) {
        return next(
            new ErrorHandler("Please provide name, description, category, price, and stock", 400)
        );
    }

    // Upload image to Cloudinary if provided
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.path, "mealdash/food-items");
        if (result) {
            filteredBody.image = { public_id: result.public_id, url: result.secure_url };
        }
    }

    // Attach restaurant and menu references
    filteredBody.restaurant = restaurantId;

    // If menuId is provided, verify the menu belongs to this restaurant
    if (req.body.menuId) {
        const menu = await Menu.findById(req.body.menuId);
        if (!menu || menu.restaurant.toString() !== restaurantId) {
            return next(new ErrorHandler("Invalid menu for this restaurant", 400));
        }
        filteredBody.menu = req.body.menuId;
    } else {
        return next(new ErrorHandler("Menu ID is required", 400));
    }

    const foodItem = await FoodItem.create(filteredBody);

    // Add the food item to the menu's category
    const menu = await Menu.findById(req.body.menuId);
    const categoryInMenu = menu.menu.find((c) => c.category === category);
    if (categoryInMenu) {
        // Category exists — push item into it
        categoryInMenu.items.push(foodItem._id);
    } else {
        // Category doesn't exist — create it with this item
        menu.menu.push({ category, items: [foodItem._id] });
    }
    await menu.save();

    res.status(201).json(
        new ApiResponse(201, "Food item created successfully", { foodItem })
    );
});


// UPDATE FOOD ITEM (restaurant-owner / admin)
exports.updateFoodItem = catchAsyncErrors(async (req, res, next) => {
    let foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
        return next(new ErrorHandler("Food item not found", 404));
    }

    // Verify ownership via restaurant
    const restaurant = await verifyRestaurantOwnership(
        foodItem.restaurant,
        req.user,
        next
    );
    if (!restaurant) return;

    const filteredBody = pickAllowedFields(req.body, ALLOWED_FIELDS);

    // Upload new image if provided
    if (req.file) {
        // Delete old image from Cloudinary
        if (foodItem.image && foodItem.image.public_id) {
            await deleteFromCloudinary(foodItem.image.public_id);
        }

        const result = await uploadOnCloudinary(req.file.path, "mealdash/food-items");
        if (result) {
            filteredBody.image = { public_id: result.public_id, url: result.secure_url };
        }
    }

    foodItem = await FoodItem.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json(
        new ApiResponse(200, "Food item updated successfully", { foodItem })
    );
});


//  DELETE FOOD ITEM (restaurant-owner / admin)
exports.deleteFoodItem = catchAsyncErrors(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
        return next(new ErrorHandler("Food item not found", 404));
    }

    // Verify ownership via restaurant
    const restaurant = await verifyRestaurantOwnership(
        foodItem.restaurant,
        req.user,
        next
    );
    if (!restaurant) return;

    // Delete image from Cloudinary
    if (foodItem.image && foodItem.image.public_id) {
        await deleteFromCloudinary(foodItem.image.public_id);
    }

    // Also remove the food item reference from the menu
    if (foodItem.menu) {
        await Menu.updateMany(
            { _id: foodItem.menu },
            { $pull: { "menu.$[].items": foodItem._id } }
        );
    }

    await FoodItem.findByIdAndDelete(req.params.id);

    res.status(200).json(
        new ApiResponse(200, "Food item deleted successfully")
    );
});


// TOGGLE AVAILABILITY (restaurant-owner / admin)
exports.toggleAvailability = catchAsyncErrors(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
        return next(new ErrorHandler("Food item not found", 404));
    }

    // Verify ownership via restaurant
    const restaurant = await verifyRestaurantOwnership(
        foodItem.restaurant,
        req.user,
        next
    );
    if (!restaurant) return;

    foodItem.isAvailable = !foodItem.isAvailable;
    await foodItem.save();

    res.status(200).json(
        new ApiResponse(200, `Food item marked as ${foodItem.isAvailable ? "available" : "unavailable"}`, {
            foodItem,
        })
    );
});


// UPDATE STOCK (restaurant-owner / admin)
exports.updateStock = catchAsyncErrors(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
        return next(new ErrorHandler("Food item not found", 404));
    }

    // Verify ownership via restaurant
    const restaurant = await verifyRestaurantOwnership(
        foodItem.restaurant,
        req.user,
        next
    );
    if (!restaurant) return;

    const { stock, operation } = req.body;

    if (stock === undefined || typeof stock !== "number" || stock < 0) {
        return next(new ErrorHandler("Please provide a valid stock value (non-negative number)", 400));
    }

    if (operation === "increment") {
        foodItem.stock += stock;
    } else if (operation === "decrement") {
        if (foodItem.stock < stock) {
            return next(new ErrorHandler("Cannot reduce stock below 0", 400));
        }
        foodItem.stock -= stock;
    } else {
        // Default: set stock to the provided value
        foodItem.stock = stock;
    }

    // Auto-toggle availability based on stock
    foodItem.isAvailable = foodItem.stock > 0;

    await foodItem.save();

    res.status(200).json(
        new ApiResponse(200, "Stock updated successfully", { foodItem })
    );
});
