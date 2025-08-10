require("dotenv").config(); // <-- Add this as the first line

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const memeRoutes = require("./routes/memeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const fixUsers = require("./fixUsers");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/memes", memeRoutes);
app.use("/api/comments", commentRoutes);

// DB + Server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");

    // Run user migration to add usernames to existing users
    try {
      await fixUsers();
      console.log("User migration completed");
    } catch (err) {
      console.log("User migration failed:", err.message);
    }

    app.listen(5000, () =>
      console.log("Server running on http://localhost:5000")
    );
  })
  .catch((err) => console.log(err));
