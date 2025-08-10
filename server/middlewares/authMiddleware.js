const jwt = require("jsonwebtoken");

exports.verifyUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

exports.verifyAdmin = (req, res, next) => {
  //console.log("verifyAdmin req.user:", req.user); // <-- Add this line

  // Assumes req.user is set by verifyUser
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
