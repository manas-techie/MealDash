const express = require("express");
const {
	signup,
	login,
	logout,
	getUserDetails,
	updatePassword,
	forgotPassword,
	resetPassword,
} = require("../controllers/auth.controller");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");



const router = express.Router();




router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", isAuthenticatedUser, logout);
router.get("/me", isAuthenticatedUser, getUserDetails);
router.patch("/updatePassword", isAuthenticatedUser, updatePassword);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);





module.exports = router;
