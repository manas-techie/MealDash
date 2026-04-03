const express = require("express");
const {
    getStripeApiKey,
    createCheckoutSession,
    stripeWebhook,
} = require("../controllers/payment.controller");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");

const router = express.Router();


// Authenticated routes
router.get("/stripe-api-key", isAuthenticatedUser, getStripeApiKey);
router.post("/create-checkout-session", isAuthenticatedUser, createCheckoutSession);

// Stripe webhook — NO auth middleware (verified via Stripe signature)
// Raw body parsing is handled in app.js
router.post("/webhook", stripeWebhook);


module.exports = router;
