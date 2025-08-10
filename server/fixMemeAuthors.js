const mongoose = require("mongoose");
const Meme = require("./models/Meme");
const User = require("./models/User");
require("dotenv").config();

async function fixMemeAuthors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all memes without authors
    const memesWithoutAuthors = await Meme.find({ author: { $exists: false } });
    console.log(`Found ${memesWithoutAuthors.length} memes without authors`);

    // Get the first user to assign as default author
    const defaultUser = await User.findOne();
    if (!defaultUser) {
      console.log("No users found in database. Cannot fix memes.");
      return;
    }

    console.log(
      `Using default user: ${defaultUser.username || defaultUser.email}`
    );

    // Update all memes without authors
    const result = await Meme.updateMany(
      { author: { $exists: false } },
      { $set: { author: defaultUser._id } }
    );

    console.log(`Updated ${result.modifiedCount} memes with default author`);

    // Also fix any memes with null authors
    const nullAuthorResult = await Meme.updateMany(
      { author: null },
      { $set: { author: defaultUser._id } }
    );

    console.log(
      `Updated ${nullAuthorResult.modifiedCount} memes with null authors`
    );

    console.log("Meme author fix completed successfully!");
  } catch (error) {
    console.error("Error fixing meme authors:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the fix
fixMemeAuthors();
