const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: [true, "Name is required."], trim: true, maxlength: 100 },
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    trim: true,
    match: [/^[+()\-\s\d]{7,20}$/, "Phone number may only contain digits, spaces, + ( ) or -."],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
    validate: {
      validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "Enter a valid email address.",
    },
  },
  address: { type: String, trim: true, default: "", maxlength: 250 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  // Small square JPEG/PNG/WebP stored as a data URL (the frontend shrinks it to ~256px first).
  photo: {
    type: String,
    default: "",
    validate: {
      validator: (v) => !v || (/^data:image\/(jpeg|png|webp);base64,/.test(v) && v.length <= 300000),
      message: "Photo must be a JPEG, PNG, or WebP image of about 200 KB or less.",
    },
  },
  isFavorite: { type: Boolean, default: false },
  notes: { type: String, trim: true, default: "", maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contact", contactSchema);
