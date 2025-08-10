// Fix existing users to have usernames
const mongoose = require("mongoose");
const User = require("./models/User");

const fixUsers = async () => {
  try {
    // Don't connect if already connected (when called from server.js)
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://localhost:27017/meme-app"
      );
      console.log("Connected to MongoDB");
    }

    // Find users without usernames
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" },
      ],
    });

    console.log(`Found ${usersWithoutUsername.length} users without usernames`);

    for (const user of usersWithoutUsername) {
      // Generate username from email
      const username = user.email.split("@")[0];
      await User.findByIdAndUpdate(user._id, { username });
      console.log(`Updated user ${user.email} with username: ${username}`);
    }

    console.log("User migration completed successfully");
    return true;
  } catch (error) {
    console.error("Error in user migration:", error);
    throw error;
  }
};

// Only run and exit if called directly
if (require.main === module) {
  require("dotenv").config();
  fixUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = fixUsers;
