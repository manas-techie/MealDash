const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../utils/catchAsyncErrors");

// check if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies?.jwt || req.headers?.authorization?.split(" ")[1];

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new ErrorHandler("User no longer exists", 401));
    }

    req.user = user;
    next();
});


// Middleware for Role-Based Authorization
// This function checks whether the logged-in user has permission
exports.authorizeRoles = (...roles) => {

    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorHandler("Not authenticated", 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role (${req.user.role}) is not allowed to access this resource`,
                    403,
                ),
            );
        }
        next();
    };
};