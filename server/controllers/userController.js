const User = require("../models/User");
const Meme = require("../models/Meme");
const Collection = require("../models/Collection");
const mongoose = require("mongoose");

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select("-password")
      .populate("followers", "username avatarUrl profile.displayName")
      .populate("following", "username avatarUrl profile.displayName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's memes count
    const memeCount = await Meme.countDocuments({ author: user._id, status: "active" });
    
    // Get user's collections count
    const collectionCount = await Collection.countDocuments({ author: user._id, isPublic: true });

    // Update user stats
    user.stats.totalMemes = memeCount;
    user.stats.totalFollowers = user.followers.length;
    await user.updateStats();

    const profileData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      stats: user.stats,
      followers: user.followers,
      following: user.following,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.status(200).json(profileData);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { displayName, bio, location, website, birthDate, isPrivate } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (displayName !== undefined) updates["profile.displayName"] = displayName;
    if (bio !== undefined) updates["profile.bio"] = bio;
    if (location !== undefined) updates["profile.location"] = location;
    if (website !== undefined) updates["profile.website"] = website;
    if (birthDate !== undefined) updates["profile.birthDate"] = birthDate;
    if (isPrivate !== undefined) updates["profile.isPrivate"] = isPrivate;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { theme, notifications, contentFilter } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (theme !== undefined) updates["preferences.theme"] = theme;
    if (notifications !== undefined) updates["preferences.notifications"] = notifications;
    if (contentFilter !== undefined) updates["preferences.contentFilter"] = contentFilter;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user preferences:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following list
    currentUser.following.push(userId);
    await currentUser.save();

    // Add to user's followers list
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    // Update stats
    await currentUser.updateStats();
    await userToFollow.updateStats();

    res.status(200).json({ message: "Successfully followed user" });
  } catch (err) {
    console.error("Error following user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    await currentUser.save();

    // Remove from user's followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);
    await userToUnfollow.save();

    // Update stats
    await currentUser.updateStats();
    await userToUnfollow.updateStats();

    res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user's memes
exports.getUserMemes = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const skip = (page - 1) * limit;
    
    const memes = await Meme.find({ 
      author: user._id,
      status: "active" 
    })
      .populate("author", "username avatarUrl profile.displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meme.countDocuments({ 
      author: user._id,
      status: "active" 
    });

    res.status(200).json({
      memes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMemes: total
      }
    });
  } catch (err) {
    console.error("Error fetching user memes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user's collections
exports.getUserCollections = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const skip = (page - 1) * limit;
    
    const collections = await Collection.find({ 
      author: user._id,
      isPublic: true 
    })
      .populate("author", "username avatarUrl profile.displayName")
      .populate("memes", "mediaUrl mediaType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Collection.countDocuments({ 
      author: user._id,
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

// Get suggested users to follow
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { limit = 10 } = req.query;

    // Get users that the current user is not following
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser.following;

    const suggestedUsers = await User.find({
      _id: { $nin: [...followingIds, currentUserId] },
      isBanned: false
    })
      .select("username avatarUrl profile.displayName stats.totalFollowers")
      .sort({ "stats.totalFollowers": -1, "stats.totalMemes": -1 })
      .limit(parseInt(limit));

    res.status(200).json(suggestedUsers);
  } catch (err) {
    console.error("Error fetching suggested users:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
