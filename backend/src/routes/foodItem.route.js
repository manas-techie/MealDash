const express = require("express");
const {
    getAllFoodItems,
    getFoodItemDetails,
    addFoodItemReview,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    toggleAvailability,
    updateStock,
} = require("../controllers/foodItem.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");
const { uploadFoodItemImage } = require("../middleware/multer.middleware");

const router = express.Router({ mergeParams: true });


router.get("/", getAllFoodItems);
router.get("/:id", getFoodItemDetails);
router.post("/:id/reviews", isAuthenticatedUser, addFoodItemReview);
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
router.patch(
    "/:id/stock",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    updateStock
);

module.exports = router;
