const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register  (always creates a regular user)
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: "user" });
  res.status(201).json({ token: sign(user), user });
}));

// POST /api/auth/login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Enter your email and password." });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Incorrect email or password." });
  if (!user.isActive)
    return res.status(403).json({ message: "This account is deactivated. Contact an admin." });

  res.json({ token: sign(user), user });
}));

module.exports = router;
