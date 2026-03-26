const express = require("express");
const {
    getAllUsers,
    getSingleUser,
    updateUserRole,
    deleteUser,
} = require("../controllers/admin.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// All routes below require authentication + admin role
router.use(isAuthenticatedUser, authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.get("/users/:id", getSingleUser);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;
