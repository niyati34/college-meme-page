const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyUser } = require("../middlewares/authMiddleware");

// Public routes
router.get("/profile/:username", userController.getUserProfile);
router.get("/:username/memes", userController.getUserMemes);
router.get("/:username/collections", userController.getUserCollections);

// Protected routes
router.use(verifyUser);
router.put("/profile", userController.updateUserProfile);
router.put("/preferences", userController.updateUserPreferences);
router.post("/follow/:userId", userController.followUser);
router.delete("/unfollow/:userId", userController.unfollowUser);
router.get("/suggestions", userController.getSuggestedUsers);

module.exports = router;
