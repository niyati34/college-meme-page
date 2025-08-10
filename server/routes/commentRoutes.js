const express = require("express");
const router = express.Router();
const {
  createComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");
const { verifyUser, verifyAdmin } = require("../middlewares/authMiddleware");

// Comments routes
router.post("/:memeId", verifyUser, createComment);
router.get("/:memeId", getComments);
router.delete("/:commentId", verifyUser, verifyAdmin, deleteComment);

module.exports = router;
