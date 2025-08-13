const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const { verifyUser } = require("../middlewares/authMiddleware");

// Public routes
router.get("/featured", collectionController.getFeaturedCollections);
router.get("/user/:userId", collectionController.getUserCollections);
router.get("/:id", collectionController.getCollection);

// Protected routes
router.use(verifyUser);
router.post("/", collectionController.createCollection);
router.put("/:id", collectionController.updateCollection);
router.delete("/:id", collectionController.deleteCollection);
router.post("/add-meme", collectionController.addMemeToCollection);
router.delete("/:collectionId/meme/:memeId", collectionController.removeMemeFromCollection);

module.exports = router;
