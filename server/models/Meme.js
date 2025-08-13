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

module.exports = mongoose.model("Meme", memeSchema);
