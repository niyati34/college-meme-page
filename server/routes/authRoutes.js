// server/routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Register new admin
router.post("/register", register);

// Login admin
router.post("/login", login);

module.exports = router;
