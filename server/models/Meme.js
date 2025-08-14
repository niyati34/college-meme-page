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
    views: { type: Number, default: 0 },
    aspectRatio: {
      type: String,
      enum: ["normal", "reel"],
      default: "normal"
    },
  },
  { timestamps: true }
);

// Add trending score calculation method
memeSchema.methods.calculateTrendingScore = function () {
  // Example: likes + views, you can adjust this logic
  return (this.likes?.length || 0) + (this.views || 0);
};

module.exports = mongoose.model("Meme", memeSchema);
