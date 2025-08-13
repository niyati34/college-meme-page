const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
  avatarUrl: { type: String },
  
  // Enhanced profile information
  profile: {
    displayName: String,
    bio: String,
    location: String,
    website: String,
    birthDate: Date,
    isPrivate: { type: Boolean, default: false }
  },
  
  // Social features
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // User preferences
  preferences: {
    theme: { type: String, enum: ["light", "dark", "auto"], default: "auto" },
    notifications: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      trending: { type: Boolean, default: true }
    },
    contentFilter: {
      nsfw: { type: Boolean, default: false },
      political: { type: Boolean, default: true },
      violence: { type: Boolean, default: false }
    }
  },
  
  // User stats
  stats: {
    totalMemes: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now }
  },
  
  // Account status
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for better performance
UserSchema.index({ "stats.totalMemes": -1 });
UserSchema.index({ "stats.totalFollowers": -1 });

// Virtual for follower count
UserSchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

// Virtual for following count
UserSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

// Method to update user stats
UserSchema.methods.updateStats = function() {
  this.stats.totalFollowers = this.followers.length;
  this.lastActive = new Date();
  return this.save();
};

module.exports = mongoose.model("User", UserSchema);
