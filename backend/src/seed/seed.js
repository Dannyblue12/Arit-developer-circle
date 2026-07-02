// One-shot seeder: creates the demo account and a full month of data.
//   npm run seed
// Demo login → phone: 08010000000  password: savi1234

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { seedForUser } = require("./seedUserData");

(async () => {
  await connectDB();

  let user = await User.findOne({ phone: "08010000000" });
  if (!user) {
    user = await User.create({
      name: "Chioma",
      phone: "08010000000",
      password: "savi1234",
      area: "Surulere, Lagos",
      incomeBand: "300k_600k",
      opayLinked: true,
    });
    console.log("✓ Demo user created (08010000000 / savi1234)");
  } else {
    console.log("• Demo user already exists");
  }

  await seedForUser(user);
  console.log("✓ Demo data seeded");
  await mongoose.disconnect();
  process.exit(0);
})();
