const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD;
const adminAuth = require("../middlewares/adminAuth");
const Admin = require("../models/Admin");
const Course = require("../models/Course");

const adminRouter = Router();

// Admin Signup Route
adminRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Zod schema for request validation
  const requiredBody = z.object({
    name: z.string().nonempty("Name is required").min(3).max(30).trim(),
    email: z.string().email("Invalid email format").trim().min(3).max(30),
    password: z.string().nonempty("Password is required").trim().min(8).max(30),
  });

  // Validate request
  const validation = requiredBody.safeParse({ name, email, password });

  if (!validation.success) {
    console.error("Validation error:", validation.error.flatten());
    return res.status(400).json({
      message: "Invalid input",
      errors: validation.error.flatten(),
    });
  }

  const {
    name: validName,
    email: validEmail,
    password: validPassword,
  } = validation.data;

  try {
    // Check if email is already registered
    const existingAdmin = await Admin.findOne({ email: validEmail });
    if (existingAdmin) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validPassword, 5);

    // Create and save new admin
    const admin = new Admin({
      name: validName,
      email: validEmail,
      password: hashedPassword,
    });

    await admin.save();

    return res.status(201).json({ message: "Admin signed up successfully" });
  } catch (err) {
    console.error("Error saving to DB:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Admin Sign In Route
adminRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // zod schema for validations
  const requiredBody = z.object({
    email: z.string().email("Invalid email format").trim().min(3).max(30),
    password: z.string().nonempty("Password is required").trim().min(8).max(30),
  });

  // Validate request
  const validation = requiredBody.safeParse({ email, password });

  if (!validation.success) {
    console.error("Validation error:", validation.error.flatten());
    return res.status(400).json({
      message: "Invalid input",
      errors: validation.error.flatten(),
    });
  }

  const { email: validEmail, password: validPassword } = validation.data;

  try {
    // check if user is present in database with entered email
    let user = await Admin.findOne({ email: validEmail });
    if (!user) {
      return res.status(403).json({
        message: "Email not found",
      });
    }

    let authorization = await bcrypt.compare(validPassword, user.password);
    if (!authorization) {
      return res.status(403).json({
        message: "Incorrect Passwrod",
      });
    } else {
      const token = jwt.sign({ id: user._id }, JWT_ADMIN_PASSWORD);
      res.json({
        message: "Sign In sucessfull",
        token: token,
      });
    }
  } catch (err) {
    console.log("Error :- ", err.message);
    res.json({
      message: err.message,
    });
  }
});

// Admin creating a course
adminRouter.post("/course", adminAuth, async (req, res) => {
  const { title, description, imageUrl, price } = req.body;
  const courseSchema = z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
    imageUrl: z.string().nonempty(),
    price: z.number().min(499).max(6999),
  });

  const validation = courseSchema.safeParse({
    title,
    description,
    imageUrl,
    price,
  });
  if (!validation.success) {
    console.log(validation.error.flatten());
    return res.json({
      message: `Validation Error : ${validation.error.flatten()}`,
    });
  }
  console.log(req.id.id);
  try {
    let newCourse = new Course({
      title: validation.data.title,
      description: validation.data.description,
      price: validation.data.price,
      imageUrl: validation.data.imageUrl,
      createdBy: `${req.id.id}`,
    });

    await newCourse.save();
    res.json({
      message: "Course Added Successfully",
    });
  } catch (err) {
    console.log("Error while creating a course : ", err.message);
    res.json({
      message: "Error while creating course",
    });
  }
});

// Admin updating a course
adminRouter.put("/course/:id", adminAuth, async (req, res) => {
  const { title, description, imageUrl, price } = req.body;
  const courseId = req.params.id;
  const adminId = req.id.id;

  // Validation Schema for data
  const courseSchema = z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
    imageUrl: z.string().nonempty(),
    price: z.number().min(499).max(6999),
  });

  // Validating Data
  const validation = courseSchema.safeParse({
    title,
    description,
    imageUrl,
    price,
  });
  // if validation is not successful
  if (!validation.success) {
    console.log(validation.error.flatten());
    return res.json({
      message: `Validation Error : ${validation.error.flatten()}`,
    });
  }

  // fetching requested admin id
  console.log(req.id.id);
  console.log(courseId);

  try {
    // fetching course by id
    let course = await Course.findById(courseId);
    // if course is not found returning response
    if (!course) {
      return res.status(403).json({
        message: "Course is not found",
      });
    }
    // if course is not created by logged in admin returning response
    if (adminId != course.createdBy) {
      return res.json({
        message: "You are not authorised to update this course",
      });
    }
    // updating course if evrything is fine
    const updatedCourse = {
      title: validation.data.title,
      description: validation.data.description,
      imageUrl: validation.data.imageUrl,
      price: validation.data.price,
      createdBy: adminId,
    };

    let result = await Course.findByIdAndUpdate(courseId, updatedCourse);
    console.log(result);
    res.json({
      message: "Course Updated Successfuly",
    });
  } catch (err) {
    console.log("Error while Updating Course :- ", err.message);
  }
});

// deleting Courses
adminRouter.delete("/course/:id", adminAuth, async (req, res) => {
  const courseId = req.params.id;
  const adminId = req.id.id;

  // fetching requested admin id
  console.log(req.id.id);
  console.log(courseId);

  try {
    // fetching course by id
    let course = await Course.findById(courseId);
    // if course is not found returning response
    if (!course) {
      return res.status(403).json({
        message: "Course is not found",
      });
    }
    // if course is not created by logged in admin returning response
    if (adminId != course.createdBy) {
      return res.json({
        message: "You are not authorised to delete this course",
      });
    }

    // delete specific course
    let result = await Course.findByIdAndDelete(courseId);
    console.log(result);
    res.json({
      message: "Course Deleted Successfuly",
    });
  } catch (err) {
    console.log("Error while Deleting Course :- ", err.message);
    res.json({
      message: "Could not find course for given Id",
    });
  }
});

module.exports = adminRouter;
