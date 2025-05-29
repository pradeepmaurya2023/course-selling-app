const { Router } = require("express");

const adminRouter = Router();

adminRouter.post("/signup", (req, res) => {
  res.json({
    message: "Admin Signup Endpoint",
  });
});

adminRouter.post("/signin", (req, res) => {
  res.json({
    message: "Admin Signin Endpoint",
  });
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
