const express = require("express");
const {
    createRestaurant,
    getAllRestaurants,
    getRestaurantDetails,
    deleteRestaurant,
} = require("../controllers/restaurant.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");


const router = express.Router({ mergeParams: true });

router.route("/").get(getAllRestaurants).post(isAuthenticatedUser, createRestaurant);