require("dotenv").config({ path: "../.env" });
const express = require("express");
const mongoose = require("mongoose");
const taskRoutes = require("./routes/tasks");
const ErrorHandler = require("./middleware/ErrorHandler");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());

// Allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:5173", // React dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.use("/api/tasks", taskRoutes);

// Centralized error handler
app.use(ErrorHandler);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
