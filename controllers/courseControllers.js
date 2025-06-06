const Course = require("../models/Course");

const sendResponse = (res, status, message, data = null) => {
  res.status(status).json({
    success: status < 400,
    message,
    ...(data && { data }),
  });
};

// ✅ Fetch all courses
async function getCourses(req, res) {
  try {
    const courses = await Course.find();
    if (courses.length === 0) {
      return sendResponse(res, 200, "No courses available", { courses: [] });
    }
    return sendResponse(res, 200, "Courses fetched successfully", { courses });
  } catch (err) {
    console.error("Error while fetching courses:", err.message);
    return sendResponse(res, 500, "Error while fetching courses");
  }
}

// ✅ Fetch specific course by ID
async function getCourseById(req, res) {
  const id = req.params.id;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return sendResponse(res, 404, "Course not found");
    }
    return sendResponse(res, 200, `Course fetched for ID: ${id}`, { course });
  } catch (err) {
    console.error("Error while fetching course by ID:", err.message);
    return sendResponse(res, 500, "Error while fetching course");
  }
}

module.exports = {
  getCourses,
  getCourseById,
};
