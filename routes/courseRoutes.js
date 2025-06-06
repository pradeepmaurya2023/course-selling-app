const { Router } = require("express");
const {
  getCourses,
  getCourseById,
} = require("../controllers/courseControllers");

const courseRouter = Router();

// ✅ Fetch all courses
courseRouter.get("/", getCourses);

// ✅ Fetch specific course by ID
courseRouter.get("/:id", getCourseById);

module.exports = courseRouter;
