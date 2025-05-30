const mongoose = require("mongoose");
const { error } = require("zod/v4/locales/ar.js");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected To DB");
  } catch (err) {
    throw new Error("Error in Connecting DB :- ", err.message);
  }
}

module.exports = connectDB;