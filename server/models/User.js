const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatarUrl: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
