const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library
const secret_key = process.env?.JWT_SECRET || "journey-tracker-secret-key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, secret_key);
      req.user = decodedToken.user;
    } catch (error) {
      console.error("Error decoding token:", error.message);
      return res.status(401).json({ data: "Invalid token", success: false });
    }
  } else {
    return res.status(401).json({ data: "Unauthorized", success: false });
  }

  next();
};

module.exports = authMiddleware;
