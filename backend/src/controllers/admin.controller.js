const User = require("../models/user.model");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { ApiResponse } = require("../utils/apiResponse");

//  GET ALL USERS
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find().lean();

    res.status(200).json(
        new ApiResponse(200, "All users fetched successfully", {
            totalUsers: users.length,
            users,
        })
    );
});

//GET SINGLE USER
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json(
        new ApiResponse(200, "User fetched successfully", { user })
    );
});

// UPDATE USER ROLE
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.body;

    const VALID_ROLES = ["user", "restaurant-owner", "admin"];

    if (!role || !VALID_ROLES.includes(role)) {
        return next(
            new ErrorHandler(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`, 400)
        );
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    // Prevent admin from changing their own role (safety guard)
    if (req.user._id.toString() === req.params.id) {
        return next(new ErrorHandler("You cannot change your own role", 400));
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, "User role updated successfully", { user })
    );
});

// DELETE USER
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
        return next(new ErrorHandler("You cannot delete your own account from here", 400));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json(
        new ApiResponse(200, "User deleted successfully")
    );
});
