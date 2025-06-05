const { Router } = require("express");
const Course = require("../models/Course");

const courseRouter = Router();

// Fetching all courses for preview
courseRouter.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    if (courses.length < 1) {
      return res.status(403).json({
        message: "Courses Not Found",
        courses: [],
      });
    }
    res.json({
      courses: courses,
    });
  } catch (err) {
    console.log("Error while Fetching Courses : ", err.message);
    res.json({
      message: "Error While Fetching Courses.",
    });
  }
});

// Fetching specific course by ID
courseRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let course = await Course.findById(id);
    if (!course) {
      return res.json({
        message: "Course is not found by ID",
      });
    }
    res.json({
      message: `Your course for id : ${id}`,
      course: course,
    });
  } catch (err) {
    console.log(`Error while fetching course by ID :- `, err.message);
    res.json({
      message: err.message,
    });
  }
});

module.exports = courseRouter;
