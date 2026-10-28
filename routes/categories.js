const express = require("express");
const Category = require("../models/Category");
const Contact = require("../models/Contact");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// Any signed-in user can read categories (needed for the contact form).
router.get("/", asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).collation({ locale: "en" }).lean();

  // Admins also get how many contacts use each category (across all users).
  if (req.user.role === "admin") {
    const counts = await Contact.aggregate([
      { $match: { category: { $ne: null } } },
      { $group: { _id: "$category", n: { $sum: 1 } } },
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.n]));
    categories.forEach((c) => { c.contactCount = byId.get(String(c._id)) || 0; });
  }
  res.json(categories);
}));

router.post("/", adminOnly, asyncHandler(async (req, res) => {
  const category = await Category.create({ name: req.body.name });
  res.status(201).json(category);
}));

router.put("/:id", adminOnly, asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found." });
  category.name = req.body.name;
  await category.save();
  res.json(category);
}));

router.delete("/:id", adminOnly, asyncHandler(async (req, res) => {
  const inUse = await Contact.countDocuments({ category: req.params.id });
  if (inUse)
    return res.status(400).json({
      message: `This category is used by ${inUse} contact${inUse === 1 ? "" : "s"} and can't be deleted.`,
    });
  const result = await Category.deleteOne({ _id: req.params.id });
  if (!result.deletedCount) return res.status(404).json({ message: "Category not found." });
  res.json({ message: "Category deleted." });
}));

module.exports = router;
