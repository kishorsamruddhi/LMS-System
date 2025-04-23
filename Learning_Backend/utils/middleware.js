const jwt = require("jsonwebtoken");
require("dotenv").config();
const encodeKey = process.env.ENCODE_KEY;

const extractToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, encodeKey);
      req.user = decodedToken.user;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ data: "Token has expired", success: false });
      } else {
        return res.status(401).json({ data: "Invalid token", success: false });
      }
    }
  } else {
    return res.status(401).json({ data: "Unauthorized", success: false });
  }

  next();
};

module.exports = extractToken;
