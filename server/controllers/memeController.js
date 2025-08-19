const Meme = require("../models/Meme");
const Comment = require("../models/Comment");
const Collection = require("../models/Collection");
const mongoose = require("mongoose");

exports.getAllMemes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      sortBy = "newest",
      search,
      tags,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { status: "active" };

    if (category) {
      filter.categories = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(",");
      filter.tags = { $in: tagArray };
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case "trending":
        sort = { trendingScore: -1, createdAt: -1 };
        break;
      case "popular":
        sort = { likes: -1, views: -1 };
        break;
      case "mostViewed":
        sort = { views: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      default: // newest
        sort = { createdAt: -1 };
    }

    const memes = await Meme.find(filter)
      .populate("author", "username avatarUrl profile.displayName")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get comment counts and calculate trending scores
    const memesWithStats = await Promise.all(
      memes.map(async (meme) => {
        const commentCount = await Comment.countDocuments({ memeId: meme._id });

        // Update trending score if not set
        if (!meme.trendingScore) {
          meme.calculateTrendingScore();
          await meme.save();
        }

        return {
          _id: meme._id,
          title: meme.title || "",
          mediaUrl: meme.mediaUrl,
          mediaType: meme.mediaType || "image",
          author: meme.author || { username: "Anonymous", avatarUrl: null },
          likes: meme.likes || [],
          dislikes: meme.dislikes || [],
          views: meme.views || 0,
          shares: meme.shares || 0,
          categories: meme.categories || [],
          tags: meme.tags || [],
          trendingScore: meme.trendingScore || 0,
          aspectRatio: meme.aspectRatio || "normal",
          createdAt: meme.createdAt,
          updatedAt: meme.updatedAt,
          comments: { length: commentCount },
        };
      })
    );

    // Get total count for pagination
    const total = await Meme.countDocuments(filter);

    res.status(200).json({
      memes: memesWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMemes: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching all memes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get trending memes
exports.getTrendingMemes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingMemes = await Meme.find({ status: "active" })
      .populate("author", "username avatarUrl profile.displayName")
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json(trendingMemes);
  } catch (err) {
    console.error("Error fetching trending memes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get memes by category
exports.getMemesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const memes = await Meme.find({
      categories: category,
      status: "active",
    })
      .populate("author", "username avatarUrl profile.displayName")
      .sort({ trendingScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meme.countDocuments({
      categories: category,
      status: "active",
    });

    res.status(200).json({
      memes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMemes: total,
      },
    });
  } catch (err) {
    console.error("Error fetching memes by category:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Search memes
exports.searchMemes = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const skip = (page - 1) * limit;

    const searchFilter = {
      status: "active",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { categories: { $in: [new RegExp(q, "i")] } },
      ],
    };

    const memes = await Meme.find(searchFilter)
      .populate("author", "username avatarUrl profile.displayName")
      .sort({ trendingScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meme.countDocuments(searchFilter);

    res.status(200).json({
      memes,
      query: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
    });
  } catch (err) {
    console.error("Error searching memes:", err);
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
      aspectRatio: meme.aspectRatio || "normal",
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
    const rawAspectRatio = (req.body.aspectRatio || "normal").toString().toLowerCase();
    const aspectRatio = rawAspectRatio === "reel" ? "reel" : "normal";
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
      aspectRatio,
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

// Create meme from a pre-uploaded media URL (avoids serverless body limits)
exports.createMemeFromUrl = async (req, res) => {
  try {
    const { title = "", mediaUrl, aspectRatio = "normal", mediaType } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({ message: "mediaUrl is required" });
    }

    // Infer media type if not provided
    let resolvedMediaType = mediaType;
    if (!resolvedMediaType) {
      const lower = mediaUrl.toLowerCase();
      const isVideo = [".mp4", ".mov", ".avi", ".mkv", ".webm"].some((ext) => lower.includes(ext));
      resolvedMediaType = isVideo ? "video" : "image";
    }

    const normalizedAspectRatio = aspectRatio === "reel" ? "reel" : "normal";

    const newMeme = new Meme({
      title,
      mediaUrl,
      mediaType: resolvedMediaType,
      author: req.user.id,
      likes: [],
      aspectRatio: normalizedAspectRatio,
    });

    await newMeme.save();
    const populatedMeme = await newMeme.populate("author", "username avatarUrl");
    res.status(201).json(populatedMeme);
  } catch (err) {
    console.error("Error creating meme from URL:", err);
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
