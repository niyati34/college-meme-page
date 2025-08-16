const mongoose = require("mongoose");

const memeSchema = new mongoose.Schema(
  {
    title: String,
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    categories: [{ type: String }],
    tags: [{ type: String }],
    status: { type: String, enum: ["active", "inactive", "deleted"], default: "active" },
    aspectRatio: {
      type: String,
      enum: ["normal", "reel"],
      default: "normal"
    },
    trendingScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Add trending score calculation method
memeSchema.methods.calculateTrendingScore = function () {
  // Calculate trending score based on likes, views, and recency
  const likeScore = (this.likes?.length || 0) * 2;
  const viewScore = this.views || 0;
  const timeScore = Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)); // Days since creation
  
  // Higher score for newer content, but still consider engagement
  this.trendingScore = likeScore + viewScore + Math.max(0, 10 - timeScore);
  return this.trendingScore;
};

module.exports = mongoose.model("Meme", memeSchema);
