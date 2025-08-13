const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  memes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meme" }],
  coverImage: String,
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  category: { type: String, enum: ["personal", "gaming", "anime", "movies", "politics", "sports", "tech", "other"] },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  stats: {
    totalMemes: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Indexes
CollectionSchema.index({ author: 1 });
CollectionSchema.index({ isPublic: 1, isFeatured: 1 });
CollectionSchema.index({ category: 1 });
CollectionSchema.index({ tags: 1 });

// Virtual for meme count
CollectionSchema.virtual('memeCount').get(function() {
  return this.memes.length;
});

// Method to update collection stats
CollectionSchema.methods.updateStats = function() {
  this.stats.totalMemes = this.memes.length;
  this.stats.totalFollowers = this.followers.length;
  return this.save();
};

module.exports = mongoose.model("Collection", CollectionSchema);
