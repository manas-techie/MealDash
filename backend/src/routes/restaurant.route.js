const express = require("express");
const {
    createRestaurant,
    getAllRestaurants,
    getRestaurantDetails,
    updateRestaurant,
    deleteRestaurant,
} = require("../controllers/restaurant.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");
const { uploadRestaurantImages } = require("../middleware/multer.middleware");

const router = express.Router({ mergeParams: true });


router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantDetails);
router.post(
    "/",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    uploadRestaurantImages,
    createRestaurant
);
router.put(
    "/:id",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    uploadRestaurantImages,
    updateRestaurant
);
router.delete(
    "/:id",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    deleteRestaurant
);

module.exports = router;
