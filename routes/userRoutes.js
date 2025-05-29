const { Router } = require("express");

const UserRouter = Router();

UserRouter.post("/signup", (req, res) => {
  res.json({
    message: "User Signup Endpoint",
  });
});

UserRouter.post("/signin", (req, res) => {
  res.json({
    message: "User Signin Endpoint",
  });
});

UserRouter.post("/course/:id/purchase", (req, res) => {
  res.json({
    message: "User Course Purchase Endpoint",
  });
});

UserRouter.get("/purchases", (req, res) => {
  res.json({
    message: "User Purchases Endpoint",
  });
});

module.exports = UserRouter;
