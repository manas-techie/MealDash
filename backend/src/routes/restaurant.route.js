const express = require("express");
const {
    createRestaurant,
    getAllRestaurants,
    getRestaurantDetails,
    updateRestaurant,
    deleteRestaurant,
} = require("../controllers/restaurant.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router({ mergeParams: true });

// ─── Public Routes ───────────────────────────────────────────────────────────
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantDetails);

// ─── Protected Routes (authenticated + role-based) ───────────────────────────
// Only restaurant-owner and admin can create a restaurant
router.post(
    "/",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    createRestaurant
);

// Only the owner of the restaurant or admin can update
// (Ownership is verified inside the controller)
router.put(
    "/:id",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    updateRestaurant
);

// Only the owner of the restaurant or admin can delete
// (Ownership is verified inside the controller)
router.delete(
    "/:id",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    deleteRestaurant
);

module.exports = router;
