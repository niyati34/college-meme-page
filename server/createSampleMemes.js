require("dotenv").config();
const mongoose = require("mongoose");
const Meme = require("./models/Meme");
const User = require("./models/User");

async function createSampleMemes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check if we have any users
    const users = await User.find().limit(1);
    if (users.length === 0) {
      console.log("No users found. Creating a sample user first...");
      const sampleUser = new User({
        email: "test@example.com",
        username: "testuser",
        password: "hashedpassword123",
        profile: {
          displayName: "Test User"
        }
      });
      await sampleUser.save();
      console.log("Sample user created:", sampleUser.username);
    }

    // Check if we have any memes
    const existingMemes = await Meme.countDocuments();
    if (existingMemes > 0) {
      console.log(`Found ${existingMemes} existing memes. Skipping sample creation.`);
      return;
    }

    const userId = users[0]?._id || (await User.findOne())._id;

    // Create sample memes
    const sampleMemes = [
      {
        title: "Funny College Life",
        mediaUrl: "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Funny+Meme",
        mediaType: "image",
        author: userId,
        categories: ["funny", "college"],
        tags: ["college", "funny", "student"],
        likes: [],
        dislikes: [],
        views: 15,
        shares: 3,
        status: "active",
        aspectRatio: "normal"
      },
      {
        title: "Gaming Moment",
        mediaUrl: "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Gaming+Meme",
        mediaType: "image",
        author: userId,
        categories: ["gaming"],
        tags: ["gaming", "funny", "gamer"],
        likes: [],
        dislikes: [],
        views: 28,
        shares: 7,
        status: "active",
        aspectRatio: "normal"
      },
      {
        title: "Tech Problems",
        mediaUrl: "https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Tech+Meme",
        mediaType: "image",
        author: userId,
        categories: ["tech", "funny"],
        tags: ["tech", "funny", "computer"],
        likes: [],
        dislikes: [],
        views: 42,
        shares: 12,
        status: "active",
        aspectRatio: "normal"
      },
      {
        title: "Anime Reference",
        mediaUrl: "https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=Anime+Meme",
        mediaType: "image",
        author: userId,
        categories: ["anime"],
        tags: ["anime", "funny", "weeb"],
        likes: [],
        dislikes: [],
        views: 35,
        shares: 8,
        status: "active",
        aspectRatio: "normal"
      },
      {
        title: "Sports Fail",
        mediaUrl: "https://via.placeholder.com/400x400/FFEAA7/FFFFFF?text=Sports+Meme",
        mediaType: "image",
        author: userId,
        categories: ["sports", "funny"],
        tags: ["sports", "funny", "fail"],
        likes: [],
        dislikes: [],
        views: 19,
        shares: 4,
        status: "active",
        aspectRatio: "normal"
      }
    ];

    // Insert sample memes
    const createdMemes = await Meme.insertMany(sampleMemes);
    console.log(`Created ${createdMemes.length} sample memes`);

    // Calculate trending scores for all memes
    for (const meme of createdMemes) {
      meme.calculateTrendingScore();
      await meme.save();
    }
    console.log("Updated trending scores for all memes");

    console.log("Sample memes created successfully!");
  } catch (error) {
    console.error("Error creating sample memes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
createSampleMemes();
