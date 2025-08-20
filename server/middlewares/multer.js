const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "memes", // Cloudinary folder name
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "mp4",
      "mov",
      "avi",
      "mkv",
      "webm",
    ],
    resource_type: "auto",
  },
});

// Configure multer with file size limits
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
    files: 1, // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "video/webm",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only images and videos are allowed."),
        false
      );
    }
  },
});

module.exports = upload;
