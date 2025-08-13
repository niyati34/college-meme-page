const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["like", "comment", "follow", "mention", "collection", "trending"],
    required: true
  },
  title: { type: String, required: true },
  message: String,
  relatedMeme: { type: mongoose.Schema.Types.ObjectId, ref: "Meme" },
  relatedCollection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Indexes for better performance
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to soft delete
NotificationSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

module.exports = mongoose.model("Notification", NotificationSchema);
