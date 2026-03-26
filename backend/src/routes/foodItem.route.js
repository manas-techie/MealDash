const express = require("express");
const {
    getAllFoodItems,
    getFoodItemDetails,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    toggleAvailability,
} = require("../controllers/foodItem.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");
const { uploadFoodItemImage } = require("../middleware/multer.middleware");

const router = express.Router({ mergeParams: true });


router.get("/", getAllFoodItems);
router.get("/:id", getFoodItemDetails);
router.post(
    "/",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    uploadFoodItemImage,
    createFoodItem
);
router.put(
    "/:id",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    uploadFoodItemImage,
    updateFoodItem
);
router.delete(
    "/:id",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    deleteFoodItem
);
router.patch(
    "/:id/toggle-availability",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    toggleAvailability
);

module.exports = router;
