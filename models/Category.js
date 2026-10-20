const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required."],
    trim: true,
    unique: true,
    maxlength: [40, "Category name is too long."],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", categorySchema);
