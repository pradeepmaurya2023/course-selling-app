require("dotenv").config();
const express = require("express");

const app = express();

const port = process.env.PORT || 3000;

// Importing Routes
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const connectDB = require("./config/db");

// Using Routes for
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/courses", courseRoutes);

app.get("/", (req, res) => {
  res.send("Home Route");
});

function main() {
  try {
    connectDB();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}.`);
    });
  } catch (err) {
    console.log("Error : ", err);
    process.exit(1);
  }
}

main();
