require("dotenv").config(); // Load environment variables locally

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const authRoutes = require("./routes/authRoutes");
const memeRoutes = require("./routes/memeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const fixUsers = require("./fixUsers");

const app = express();

// Configure CORS
app.use(cors());

// Configure body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/memes", memeRoutes);
app.use("/api/comments", commentRoutes);

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large. Maximum size is 10MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(413).json({
        error: "Too many files. Only 1 file allowed.",
      });
    }
    return res.status(400).json({
      error: "File upload error: " + error.message,
    });
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      error: error.message,
    });
  }

  next(error);
});

// Mongoose connection cache to speed up serverless cold starts
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Only run migrations when explicitly enabled to avoid running on every serverless invocation
async function maybeRunMigrations() {
  if (process.env.RUN_MIGRATIONS === "true") {
    try {
      await fixUsers();
      console.log("User migration completed");
    } catch (err) {
      console.log("User migration failed:", err.message);
    }
  }
}

// Export Vercel Node function handler
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    await maybeRunMigrations();
    return app(req, res);
  } catch (err) {
    console.error("Server error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
};

// Start local server when not running on Vercel
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  connectToDatabase()
    .then(() => {
      console.log("MongoDB connected"); // <-- Add this line
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => console.error("Mongo connection error:", err));
}
