const express = require("express");
const {
    getAllMenus,
    createMenu,
    deleteMenu,
    addItemsToMenu,
    removeItemsFromMenu,
} = require("../controllers/menu.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router({ mergeParams: true });


router.get("/", getAllMenus);
router.post(
    "/",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    createMenu
);
router.delete(
    "/:id",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    deleteMenu
);
router.post(
    "/:menuId/items",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    addItemsToMenu
);
router.delete(
    "/:menuId/items",
    isAuthenticatedUser,
    authorizeRoles("restaurant-owner", "admin"),
    removeItemsFromMenu
);

module.exports = router;