const { Router } = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_ADMIN_PASSWORD = "AdminPasskey";
const Admin = require("../models/Admin");

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

adminRouter.post("/course", (req, res) => {
  res.json({
    message: "Admin Course Create Endpoint",
  });
});

adminRouter.put("/course/:id", (req, res) => {
  res.json({
    message: "Admin Course Update Endpoint",
  });
});

adminRouter.delete("/course/:id", (req, res) => {
  res.json({
    message: "Admin Course Delete Endpoint",
  });
});

module.exports = adminRouter;
