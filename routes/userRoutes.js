const { Router } = require("express");
const {
  userSignup,
  userSignIn,
  userPurchasesCourse,
  userGetPurchasedCourses,
} = require("../controllers/userContollers");

const UserRouter = Router();

// User Signup Endpoint
UserRouter.post("/signup", userSignup);

// User Sign In Endpoint
UserRouter.post("/signin", userSignIn);

// User purchases a course
UserRouter.post("/course/:id/purchase", userAuth, userPurchasesCourse);

// User Accessing all the courses purchased by him
UserRouter.get("/purchases", userAuth, userGetPurchasedCourses);

module.exports = UserRouter;
