const Collection = require("../models/Collection");
const Meme = require("../models/Meme");
const mongoose = require("mongoose");

// Create a new collection
exports.createCollection = async (req, res) => {
  try {
    const { name, description, isPublic, category, tags } = req.body;
    const author = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    const collection = new Collection({
      name,
      description,
      author,
      isPublic: isPublic !== undefined ? isPublic : true,
      category,
      tags: tags || []
    });

    await collection.save();
    await collection.populate("author", "username avatarUrl profile.displayName");

    res.status(201).json(collection);
  } catch (err) {
    console.error("Error creating collection:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user's collections
exports.getUserCollections = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const collections = await Collection.find({ 
      author: userId,
      isPublic: true 
    })
      .populate("author", "username avatarUrl profile.displayName")
      .populate("memes", "mediaUrl mediaType title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Collection.countDocuments({ 
      author: userId,
      isPublic: true 
    });

    res.status(200).json({
      collections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCollections: total
      }
    });
  } catch (err) {
    console.error("Error fetching user collections:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get collection by ID
exports.getCollection = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    const collection = await Collection.findById(id)
      .populate("author", "username avatarUrl profile.displayName")
      .populate("memes", "mediaUrl mediaType title author likes views");

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (!collection.isPublic && collection.author._id.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(collection);
  } catch (err) {
    console.error("Error fetching collection:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add meme to collection
exports.addMemeToCollection = async (req, res) => {
  try {
    const { collectionId, memeId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(collectionId) || !mongoose.Types.ObjectId.isValid(memeId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }

    if (collection.memes.includes(memeId)) {
      return res.status(400).json({ message: "Meme already in collection" });
    }

    collection.memes.push(memeId);
    await collection.save();
    await collection.updateStats();

    res.status(200).json({ message: "Meme added to collection", collection });
  } catch (err) {
    console.error("Error adding meme to collection:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove meme from collection
exports.removeMemeFromCollection = async (req, res) => {
  try {
    const { collectionId, memeId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(collectionId) || !mongoose.Types.ObjectId.isValid(memeId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    collection.memes = collection.memes.filter(id => id.toString() !== memeId);
    await collection.save();
    await collection.updateStats();

    res.status(200).json({ message: "Meme removed from collection", collection });
  } catch (err) {
    console.error("Error removing meme from collection:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update collection
exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, category, tags } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;

    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate("author", "username avatarUrl profile.displayName");

    res.status(200).json(updatedCollection);
  } catch (err) {
    console.error("Error updating collection:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete collection
exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Collection.findByIdAndDelete(id);
    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (err) {
    console.error("Error deleting collection:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get featured collections
exports.getFeaturedCollections = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const featuredCollections = await Collection.find({ 
      isPublic: true,
      isFeatured: true 
    })
      .populate("author", "username avatarUrl profile.displayName")
      .populate("memes", "mediaUrl mediaType")
      .sort({ "stats.totalFollowers": -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json(featuredCollections);
  } catch (err) {
    console.error("Error fetching featured collections:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
