const express = require("express");
const {
    placeOrder,
    getMyOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
    getRestaurantOrders,
    getAllOrders,
} = require("../controllers/order.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();


// User routes
router.post("/", isAuthenticatedUser, placeOrder);
router.get("/my-orders", isAuthenticatedUser, getMyOrders);
router.get("/:id", isAuthenticatedUser, getOrderDetails);
router.patch("/:id/cancel", isAuthenticatedUser, cancelOrder);

// Restaurant-owner routes
router.get(
    "/restaurant/:restaurantId",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    getRestaurantOrders
);

// Restaurant-owner / Admin routes
router.patch(
    "/:id/status",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    updateOrderStatus
);

// Admin routes
router.get(
    "/admin/all",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getAllOrders
);

module.exports = router;
