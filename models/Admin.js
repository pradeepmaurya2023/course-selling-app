const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    min: 8,
    max: 30,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
