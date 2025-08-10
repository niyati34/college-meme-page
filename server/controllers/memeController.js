const Meme = require("../models/Meme");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");

exports.getAllMemes = async (req, res) => {
  try {
    const memes = await Meme.find()
      .populate("author", "username avatarUrl")
      .sort({ createdAt: -1 });

    // Get comment counts for each meme
    const memesWithComments = await Promise.all(
      memes.map(async (meme) => {
        const commentCount = await Comment.countDocuments({ memeId: meme._id });
        return {
          _id: meme._id,
          title: meme.title || "",
          mediaUrl: meme.mediaUrl,
          mediaType: meme.mediaType || "image",
          author: meme.author || { username: "Anonymous", avatarUrl: null },
          likes: meme.likes || [],
          views: meme.views || 0,
          createdAt: meme.createdAt,
          updatedAt: meme.updatedAt,
          comments: { length: commentCount },
        };
      })
    );

    res.status(200).json(memesWithComments);
  } catch (err) {
    console.error("Error fetching all memes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getMeme = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to fetch meme with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format:", id);
      return res.status(404).json({ message: "Invalid meme ID format" });
    }

    const meme = await Meme.findById(id)
      .populate("author", "username avatarUrl")
      .populate("likes", "_id");

    if (!meme) {
      console.log("Meme not found with ID:", id);
      return res.status(404).json({ message: "Meme not found" });
    }

    console.log("Found meme:", meme._id);

    // Get comment count for this meme
    const commentCount = await Comment.countDocuments({ memeId: meme._id });

    // Ensure the response has the correct structure
    const responseData = {
      _id: meme._id,
      title: meme.title || "",
      mediaUrl: meme.mediaUrl,
      mediaType: meme.mediaType || "image",
      author: meme.author || { username: "Anonymous", avatarUrl: null },
      likes: meme.likes || [],
      views: meme.views || 0,
      createdAt: meme.createdAt,
      updatedAt: meme.updatedAt,
      comments: { length: commentCount },
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error in getMeme:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteMeme = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid meme ID format" });
    }

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }

    // Delete all comments associated with this meme
    await Comment.deleteMany({ memeId: id });

    // Delete the meme
    await Meme.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Meme and associated comments deleted successfully" });
  } catch (err) {
    console.error("Error deleting meme:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createMeme = async (req, res) => {
  try {
    console.log("Creating new meme with body:", req.body);

    const { title } = req.body;
    const file = req.file;

    if (!file) {
      console.log("No file provided");
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Determine media type based on file format
    const videoFormats = ["mp4", "mov", "avi", "mkv", "webm"];
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    const mediaType = videoFormats.includes(fileExtension) ? "video" : "image";

    const newMeme = new Meme({
      title,
      mediaUrl: file.path,
      mediaType,
      author: req.user.id,
      likes: [],
    });

    console.log("Created meme object:", newMeme);
    await newMeme.save();
    console.log("Saved meme to database with ID:", newMeme._id);

    const populatedMeme = await newMeme.populate(
      "author",
      "username avatarUrl"
    );
    console.log("Populated meme:", populatedMeme);

    res.status(201).json(populatedMeme);
  } catch (err) {
    console.error("Error creating meme:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to toggle like for meme:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format:", id);
      return res.status(404).json({ message: "Invalid meme ID format" });
    }

    const meme = await Meme.findById(id);

    if (!meme) {
      console.log("Meme not found for like toggle:", id);
      return res.status(404).json({ message: "Meme not found" });
    }

    if (!Array.isArray(meme.likes)) {
      meme.likes = [];
    }

    const userId = req.user.id;
    const isLiked = meme.likes.map(String).includes(String(userId));

    if (isLiked) {
      meme.likes = meme.likes.filter((id) => String(id) !== String(userId));
    } else {
      meme.likes.push(userId);
    }

    await meme.save();
    res.json({ likes: meme.likes || [] });
  } catch (err) {
    console.error("Error in toggleLike:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to increment views for meme:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format:", id);
      return res.status(404).json({ message: "Invalid meme ID format" });
    }

    const meme = await Meme.findById(id);

    if (!meme) {
      console.log("Meme not found for view increment:", id);
      return res.status(404).json({ message: "Meme not found" });
    }

    meme.views += 1;
    await meme.save();
    res.json({ views: meme.views });
  } catch (err) {
    console.error("Error incrementing views:", err);
    res.status(500).json({ message: "Server error" });
  }
};
