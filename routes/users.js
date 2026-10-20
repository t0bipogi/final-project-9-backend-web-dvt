const express = require("express");
const User = require("../models/User");
const Contact = require("../models/Contact");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const isSelf = (req) => String(req.user._id) === req.params.id;
const canAccess = (req) => isSelf(req) || req.user.role === "admin";

// GET /api/users  (admin)
router.get("/", adminOnly, asyncHandler(async (_req, res) => {
  res.json(await User.find().sort({ createdAt: -1 }));
}));

// GET /api/users/:id  (self or admin)
router.get("/:id", asyncHandler(async (req, res) => {
  if (!canAccess(req)) return res.status(403).json({ message: "You can only view your own profile." });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json(user);
}));

// PUT /api/users/:id  (self or admin)
// Everyone can change name, email, password. Only admins can change role and isActive.
router.put("/:id", asyncHandler(async (req, res) => {
  if (!canAccess(req)) return res.status(403).json({ message: "You can only edit your own profile." });

  const user = await User.findById(req.params.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found." });

  const { name, email, password, role, isActive } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (password) user.password = password; // hashed by the pre-save hook

  if (req.user.role === "admin") {
    if (isSelf(req) && ((role && role !== "admin") || isActive === false))
      return res.status(400).json({ message: "You can't demote or deactivate your own account." });
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = !!isActive;
  }

  await user.save();
  res.json(user);
}));

// DELETE /api/users/:id  (admin) – also removes that user's contacts
router.delete("/:id", adminOnly, asyncHandler(async (req, res) => {
  if (isSelf(req)) return res.status(400).json({ message: "You can't delete your own account." });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  await Contact.deleteMany({ owner: user._id });
  res.json({ message: "User deleted." });
}));

module.exports = router;
