const { Router } = require("express");
const {
  adminSignup,
  adminSignin,
  adminCreateCourse,
  adminUpdateCourseById,
  adminDeleteCourseById,
} = require("../controllers/adminControllers");

const adminRouter = Router();

// ✅ Admin Signup
adminRouter.post("/signup", adminSignup);

// ✅ Admin Sign In
adminRouter.post("/signin", adminSignin);

// ✅ Admin Create Course
adminRouter.post("/course", adminAuth, adminCreateCourse);

// ✅ Admin Update Course
adminRouter.put("/course/:id", adminAuth, adminUpdateCourseById);

// ✅ Admin Delete Course
adminRouter.delete("/course/:id", adminAuth, adminDeleteCourseById);

module.exports = adminRouter;
