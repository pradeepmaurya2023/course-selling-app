const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuth = require("../middlewares/userAuth");
const JWT_SECRET_USER = process.env.JWT_SECRET_USER;

const User = require("../models/User");
const Course = require("../models/Course");
const Purchases = require("../models/Purchases");
const UserRouter = Router();

// will send same strucute response
const sendResponse = (res, status, message, data = null) => {
  res.status(status).json({ message, ...(data && { data }) });
};

// User Signup Endpoint
UserRouter.post("/signup", async (req, res) => {
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 409, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return sendResponse(res, 201, "User signed up successfully");
  } catch (err) {
    console.error("Signup error:", err);
    return sendResponse(res, 500, "Internal server error");
  }
});

// User Sign In Endpoint
UserRouter.post("/signin", async (req, res) => {
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
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, "Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return sendResponse(res, 401, "Invalid email or password");
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET_USER, {
      expiresIn: "1h",
    });

    return sendResponse(res, 200, "Sign in successful", { token });
  } catch (err) {
    console.error("Signin error:", err);
    return sendResponse(res, 500, "Internal server error");
  }
});

// User purchases a course
UserRouter.post("/course/:id/purchase", userAuth, async (req, res) => {
  const courseId = req.params.id;
  const userId = req.id;

  try {
    let course = await Course.findById(courseId);
    if (!course) {
      return sendResponse(res, 404, "Course is not found.", course);
    }
    let newPurchase = new Purchases({ userId: userId, courseId: courseId });
    await newPurchase.save();

    return sendResponse(res, 200, "Course Purchased Successfully.");
  } catch (err) {
    console.log("Error while Purchasing course : ", err);
    return sendResponse(res, 403, "Error while Purchasing course.");
  }
});

// User Accessing all the courses purchased by him
UserRouter.get("/purchases", userAuth, async (req, res) => {
  const userId = req.id;

  try {
    let courses = await Purchases.find({ userId: userId });
    if (courses.length < 1) {
      return sendResponse(res, 404, "You don't have purchased any course yet.");
    }
    return sendResponse(
      res,
      200,
      "Your Ourchased courses are fetched successfully.",
      courses
    );
  } catch (err) {
    console.log("Error while fetching courses : ", err);
    return sendResponse(res, 500, "Internal Server Error.");
  }
});

module.exports = UserRouter;
