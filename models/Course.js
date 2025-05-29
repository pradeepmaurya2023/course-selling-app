const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  price: Number,
  createdBy: mongoose.Types.ObjectId,
});
const Course = mongoose.model("course", courseSchema);

module.exports = Course;
