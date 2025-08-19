const express = require("express");
const router = express.Router();

const {
  createMeme,
  createMemeFromUrl,
  getAllMemes,
  getMeme,
  deleteMeme,
  toggleLike,
  incrementViews,
  getTrendingMemes,
  getMemesByCategory,
  searchMemes,
} = require("../controllers/memeController");

const { verifyUser, verifyAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// Public routes
router.get("/", getAllMemes);
router.get("/trending", getTrendingMemes);
router.get("/category/:category", getMemesByCategory);
router.get("/search", searchMemes);
router.get("/:id", getMeme);
router.post("/view/:id", incrementViews);

// Protected routes
router.post("/like/:id", verifyUser, toggleLike);
router.delete("/:id", verifyUser, verifyAdmin, deleteMeme);

// Admin upload
router.post(
  "/upload",
  verifyUser,
  verifyAdmin,
  upload.single("media"),
  createMeme
);

// Alternative small JSON endpoint for pre-uploaded media URLs
router.post("/create-from-url", verifyUser, verifyAdmin, createMemeFromUrl);

module.exports = router;
