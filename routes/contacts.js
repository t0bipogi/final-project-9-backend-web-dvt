const express = require("express");
const Contact = require("../models/Contact");
const Category = require("../models/Category");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const FIELDS = ["name", "phone", "email", "address", "category", "isFavorite", "notes", "photo"];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

const checkCategory = async (data) => {
  if (data.category === "" || data.category === undefined) data.category = null;
  if (data.category && !(await Category.exists({ _id: data.category }))) {
    const err = new Error("That category does not exist.");
    err.status = 400;
    throw err;
  }
};

// Every query is scoped to the signed-in user, so users only ever see their own contacts.
const findOwn = (req) => Contact.findOne({ _id: req.params.id, owner: req.user._id }).populate("category");

// GET /api/contacts   (optional ?search= and ?category= filters)
router.get("/", asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
  }
  const contacts = await Contact.find(filter).populate("category").sort({ createdAt: -1 });
  res.json(contacts);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const contact = await findOwn(req);
  if (!contact) return res.status(404).json({ message: "Contact not found." });
  res.json(contact);
}));

router.post("/", asyncHandler(async (req, res) => {
  const data = pick(req.body);
  await checkCategory(data);
  const contact = await Contact.create({ ...data, owner: req.user._id });
  res.status(201).json(await contact.populate("category"));
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const contact = await findOwn(req);
  if (!contact) return res.status(404).json({ message: "Contact not found." });

  const data = pick(req.body);
  if ("category" in data) await checkCategory(data);
  contact.set(data);
  await contact.save();
  res.json(await contact.populate("category"));
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await Contact.deleteOne({ _id: req.params.id, owner: req.user._id });
  if (!result.deletedCount) return res.status(404).json({ message: "Contact not found." });
  res.json({ message: "Contact deleted." });
}));

module.exports = router;
