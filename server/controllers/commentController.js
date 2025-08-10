const Comment = require("../models/Comment");
const jwt = require("jsonwebtoken");

exports.createComment = async (req, res) => {
  try {
    const { memeId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const comment = new Comment({
      memeId,
      text: text.trim(),
      author: req.user.id,
    });

    await comment.save();

    // Populate the author information before sending response
    await comment.populate("author", "username avatarUrl email role");

    res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { memeId } = req.params;

    const comments = await Comment.find({ memeId })
      .populate("author", "username avatarUrl email role")
      .sort({ createdAt: -1 }); // Most recent first

    // Check if requesting user is admin (if token provided)
    let isAdmin = false;
    const token = req.headers.authorization;
    if (token) {
      try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        isAdmin = decoded.role === "admin";
        console.log("User role:", decoded.role, "Is admin:", isAdmin);
      } catch (err) {
        console.log("Token verification failed:", err.message);
        // Not a valid token, continue as regular user
      }
    }

    // Format comments based on user role
    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      memeId: comment.memeId,
      author: {
        _id: comment.author._id,
        username: isAdmin
          ? comment.author.username ||
            comment.author.email?.split("@")[0] ||
            "Anonymous User"
          : "Anonymous",
        avatarUrl: comment.author.avatarUrl,
        // Only show email and role to admin
        ...(isAdmin && {
          email: comment.author.email,
          role: comment.author.role,
        }),
      },
    }));

    console.log(
      "Returning comments for admin:",
      isAdmin,
      "Count:",
      formattedComments.length
    );
    res.json(formattedComments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: err.message });
  }
};
