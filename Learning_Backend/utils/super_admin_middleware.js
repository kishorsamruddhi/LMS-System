const jwt = require("jsonwebtoken");
require("dotenv").config();
const encodeKey = process.env.ENCODE_KEY;

const extractSuperToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ data: "Unauthorized", success: false });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, encodeKey);
    req.user = decodedToken.user;

    if (req.user.role !== "super-admin") {
      return res.status(403).json({
        data: "Forbidden: Only Super admins can access",
        success: false,
      });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ data: "Token has expired", success: false });
    } else {
      return res
        .status(401)
        .json({ data: error.message || "Invalid token", success: false });
    }
  }

  next();
};

module.exports = extractSuperToken;
