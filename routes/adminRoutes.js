const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminAuth = require("../middlewares/adminAuth");
const Admin = require("../models/Admin");
const Course = require("../models/Course");

const adminRouter = Router();

const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN;

const sendResponse = (res, status, message, data = null) => {
  res.status(status).json({ message, ...(data && { data }) });
};

// ✅ Admin Signup
adminRouter.post("/signup", async (req, res) => {
  const schema = z.object({
    name: z.string().nonempty().min(3).max(30).trim(),
    email: z.string().email().trim().min(3).max(30),
    password: z.string().nonempty().min(8).max(30).trim(),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return sendResponse(res, 422, "Invalid input", {
      errors: validation.error.flatten(),
    });
  }

  const { name, email, password } = validation.data;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return sendResponse(res, 409, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();

    return sendResponse(res, 201, "Admin signed up successfully");
  } catch (err) {
    console.error("Signup error:", err);
    return sendResponse(res, 500, "Internal server error");
  }
});

// ✅ Admin Sign In
adminRouter.post("/signin", async (req, res) => {
  const schema = z.object({
    email: z.string().email().trim().min(3).max(30),
    password: z.string().nonempty().min(8).max(30).trim(),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return sendResponse(res, 422, "Invalid input", {
      errors: validation.error.flatten(),
    });
  }

  const { email, password } = validation.data;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return sendResponse(res, 401, "Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return sendResponse(res, 401, "Invalid email or password");
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET_ADMIN, {
      expiresIn: "1h",
    });

    return sendResponse(res, 200, "Sign in successful", { token });
  } catch (err) {
    console.error("Signin error:", err);
    return sendResponse(res, 500, "Internal server error");
  }
});

// ✅ Admin Create Course
adminRouter.post("/course", adminAuth, async (req, res) => {
  const schema = z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
    imageUrl: z.string().nonempty(),
    price: z.number().min(499).max(6999),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return sendResponse(res, 422, "Validation error", {
      errors: validation.error.flatten(),
    });
  }

  try {
    const course = new Course({
      ...validation.data,
      createdBy: req.id.id,
    });

    await course.save();
    return sendResponse(res, 201, "Course added successfully");
  } catch (err) {
    console.error("Create course error:", err);
    return sendResponse(res, 500, "Error while creating course");
  }
});

// ✅ Admin Update Course
adminRouter.put("/course/:id", adminAuth, async (req, res) => {
  const courseId = req.params.id;
  const adminId = req.id.id;

  const schema = z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
    imageUrl: z.string().nonempty(),
    price: z.number().min(499).max(6999),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return sendResponse(res, 422, "Validation error", {
      errors: validation.error.flatten(),
    });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return sendResponse(res, 404, "Course not found");
    }

    if (course.createdBy.toString() !== adminId) {
      return sendResponse(res, 403, "You are not authorized to update this course");
    }

    await Course.findByIdAndUpdate(courseId, { ...validation.data });

    return sendResponse(res, 200, "Course updated successfully");
  } catch (err) {
    console.error("Update course error:", err);
    return sendResponse(res, 500, "Error while updating course");
  }
});

// ✅ Admin Delete Course
adminRouter.delete("/course/:id", adminAuth, async (req, res) => {
  const courseId = req.params.id;
  const adminId = req.id.id;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return sendResponse(res, 404, "Course not found");
    }

    if (course.createdBy.toString() !== adminId) {
      return sendResponse(res, 403, "You are not authorized to delete this course");
    }

    await Course.findByIdAndDelete(courseId);

    return sendResponse(res, 200, "Course deleted successfully");
  } catch (err) {
    console.error("Delete course error:", err);
    return sendResponse(res, 500, "Error while deleting course");
  }
});

module.exports = adminRouter;
