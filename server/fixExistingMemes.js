require("dotenv").config();
const mongoose = require("mongoose");
const Meme = require("./models/Meme");

async function fixExistingMemes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Find all memes that don't have the required fields
    const memesToFix = await Meme.find({
      $or: [
        { status: { $exists: false } },
        { categories: { $exists: false } },
        { tags: { $exists: false } },
        { dislikes: { $exists: false } },
        { shares: { $exists: false } },
        { trendingScore: { $exists: false } }
      ]
    });

    console.log(`Found ${memesToFix.length} memes that need fixing`);

    if (memesToFix.length === 0) {
      console.log("All memes are already properly formatted!");
      return;
    }

    // Fix each meme
    for (const meme of memesToFix) {
      // Set default values for missing fields
      if (!meme.status) meme.status = "active";
      if (!meme.categories) meme.categories = ["funny"];
      if (!meme.tags) meme.tags = ["meme"];
      if (!meme.dislikes) meme.dislikes = [];
      if (!meme.shares) meme.shares = 0;
      if (!meme.trendingScore) meme.trendingScore = 0;

      // Calculate trending score
      meme.calculateTrendingScore();
      
      await meme.save();
      console.log(`Fixed meme: ${meme.title || meme._id}`);
    }

    console.log("All memes have been fixed!");

    // Verify the fix by counting active memes
    const activeMemes = await Meme.countDocuments({ status: "active" });
    console.log(`Total active memes: ${activeMemes}`);

  } catch (error) {
    console.error("Error fixing memes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
fixExistingMemes();
