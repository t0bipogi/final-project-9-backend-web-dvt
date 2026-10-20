// Turns Mongoose and other errors into { message } JSON the frontend can show.
exports.notFound = (req, res) => res.status(404).json({ message: "Route not found." });

exports.errorHandler = (err, req, res, _next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(" ");
    return res.status(400).json({ message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const label = field === "email" ? "Email" : field === "name" ? "Category" : "Value";
    return res.status(400).json({ message: `${label} is already in use.` });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id." });

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error." });
};
