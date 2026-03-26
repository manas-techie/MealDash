const express = require("express");
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require("../controllers/cart.controller");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");

const router = express.Router();

// All cart routes require authentication
router.use(isAuthenticatedUser);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
