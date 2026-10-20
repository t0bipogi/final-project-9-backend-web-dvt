// Creates the first admin account and a few starter categories.
// Safe to run more than once.
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Category = require("../models/Category");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  if (await User.exists({ email })) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
    });
    console.log(`Admin created: ${email}`);
  }

  for (const name of ["Family", "Friends", "Work", "Other"]) {
    if (!(await Category.exists({ name }))) {
      await Category.create({ name });
      console.log(`Category added: ${name}`);
    }
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
