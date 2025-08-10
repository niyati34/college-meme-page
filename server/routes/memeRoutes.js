const express = require("express");
const router = express.Router();

const {
  createMeme,
  getAllMemes,
  getMeme,
  deleteMeme,
  toggleLike,
  incrementViews,
} = require("../controllers/memeController");

const { verifyUser, verifyAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// Public routes
router.get("/", getAllMemes);
router.get("/:id", getMeme); // Add route for getting single meme
router.post("/view/:id", incrementViews);

// Protected routes
router.post("/like/:id", verifyUser, toggleLike);
router.delete("/:id", verifyUser, verifyAdmin, deleteMeme); // Admin can delete memes

// Admin upload
router.post(
  "/upload",
  verifyUser,
  verifyAdmin,
  upload.single("media"),
  createMeme
);
module.exports = router;
