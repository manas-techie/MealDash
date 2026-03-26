const Menu = require("../models/menu.model");
const Restaurant = require("../models/restaurant.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");


// GET ALL MENUS FOR A RESTAURANT (Public)
exports.getAllMenus = catchAsyncErrors(async (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    if (!restaurantId) {
        return next(new ErrorHandler("Restaurant ID is required", 400));
    }

    const menus = await Menu.find({ restaurant: restaurantId })
        .populate("menu.items")
        .lean();

    res.status(200).json(
        new ApiResponse(200, "Menus fetched successfully", { menus })
    );
});


// CREATE MENU (restaurant-owner / admin)
exports.createMenu = catchAsyncErrors(async (req, res, next) => {
    const restaurantId = req.params.restaurantId;

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new ErrorHandler("Restaurant not found", 404));
    }

    // Ownership check: only the restaurant owner or admin can create menus
    if (
        restaurant.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        return next(
            new ErrorHandler("You are not authorized to create a menu for this restaurant", 403)
        );
    }

    const { menu } = req.body;

    const newMenu = await Menu.create({
        menu: menu || [],
        restaurant: restaurantId,
    });

    res.status(201).json(
        new ApiResponse(201, "Menu created successfully", { menu: newMenu })
    );
});


//  DELETE MENU (restaurant-owner / admin)
exports.deleteMenu = catchAsyncErrors(async (req, res, next) => {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
        return next(new ErrorHandler("Menu not found", 404));
    }

    // Ownership check via restaurant
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (
        !restaurant ||
        (restaurant.owner.toString() !== req.user._id.toString() &&
            req.user.role !== "admin")
    ) {
        return next(
            new ErrorHandler("You are not authorized to delete this menu", 403)
        );
    }

    await Menu.findByIdAndDelete(req.params.id);

    res.status(200).json(
        new ApiResponse(200, "Menu deleted successfully")
    );
});


// ADD ITEMS TO MENU (restaurant-owner / admin)
exports.addItemsToMenu = catchAsyncErrors(async (req, res, next) => {
    const { category, items } = req.body;
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) {
        return next(new ErrorHandler("Menu not found", 404));
    }

    // Ownership check via restaurant
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (
        !restaurant ||
        (restaurant.owner.toString() !== req.user._id.toString() &&
            req.user.role !== "admin")
    ) {
        return next(
            new ErrorHandler("You are not authorized to modify this menu", 403)
        );
    }

    if (!category || !items || !Array.isArray(items)) {
        return next(new ErrorHandler("Category and items array are required", 400));
    }

    // Find existing category or create new one
    const categoryInMenu = menu.menu.find((item) => item.category === category);
    if (!categoryInMenu) {
        menu.menu.push({ category, items });
    } else {
        categoryInMenu.items.push(...items);
    }

    await menu.save();
    await menu.populate("menu.items");

    res.status(200).json(
        new ApiResponse(200, "Items added to menu successfully", { menu })
    );
});


// REMOVE ITEMS FROM MENU (restaurant-owner / admin)
exports.removeItemsFromMenu = catchAsyncErrors(async (req, res, next) => {
    const { category, items } = req.body;
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) {
        return next(new ErrorHandler("Menu not found", 404));
    }

    // Ownership check via restaurant
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (
        !restaurant ||
        (restaurant.owner.toString() !== req.user._id.toString() &&
            req.user.role !== "admin")
    ) {
        return next(
            new ErrorHandler("You are not authorized to modify this menu", 403)
        );
    }

    if (!category || !items || !Array.isArray(items)) {
        return next(new ErrorHandler("Category and items array are required", 400));
    }

    const categoryInMenu = menu.menu.find((item) => item.category === category);
    if (!categoryInMenu) {
        return next(new ErrorHandler("Category not found in this menu", 404));
    }

    // Convert item IDs to strings for proper comparison
    const itemStrings = items.map((id) => id.toString());
    categoryInMenu.items = categoryInMenu.items.filter(
        (item) => !itemStrings.includes(item.toString())
    );

    await menu.save();
    await menu.populate("menu.items");

    res.status(200).json(
        new ApiResponse(200, "Items removed from menu successfully", { menu })
    );
});
