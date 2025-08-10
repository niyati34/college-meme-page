const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    memeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meme",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
