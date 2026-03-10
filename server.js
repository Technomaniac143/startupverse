const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiter — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests. Please try again later." }
});
app.use(limiter);

// Stricter limiter for the expensive AI endpoint
const evaluateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many evaluation requests. Please try again later." }
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/evaluate", evaluateLimiter, require("./routes/evaluate"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/investors", require("./routes/investors"));
app.use("/api/notifications", require("./routes/notifications"));

app.listen(5000, () => console.log("Server running on port 5000"));