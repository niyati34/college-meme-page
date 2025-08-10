require('dotenv').config();
const mongoose = require('mongoose');
const Meme = require('./models/Meme');

async function fixMemeIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all memes
    const memes = await Meme.find();
    console.log(`Found ${memes.length} memes`);

    // Process each meme
    for (const meme of memes) {
      const oldId = meme._id;
      console.log(`Processing meme: ${oldId}`);

      try {
        // Create a new meme with the same data but let MongoDB generate a new ObjectId
        const newMeme = new Meme({
          title: meme.title,
          mediaUrl: meme.mediaUrl,
          author: meme.author,
          likes: meme.likes,
          views: meme.views,
          createdAt: meme.createdAt,
          updatedAt: meme.updatedAt
        });

        // Save the new meme
        await newMeme.save();
        console.log(`Created new meme with ID: ${newMeme._id}`);

        // Delete the old meme
        await Meme.findByIdAndDelete(oldId);
        console.log(`Deleted old meme with ID: ${oldId}`);
      } catch (err) {
        console.error(`Error processing meme ${oldId}:`, err);
      }
    }

    console.log('Finished processing all memes');
    process.exit(0);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

fixMemeIds(); 