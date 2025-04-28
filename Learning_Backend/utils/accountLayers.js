const messages = {
  admin: "Setup Institute/Business to use this service",
  user: "Connect to Institute/Business to use this service",
};

const checkStartedStatus = (req, res, next) => {
  const user = req.user;
  if (user?.business_course_id) {
    return next();
  }
  const role = user.role;
  const sendMessage = messages[role] || "Resource not available";
  return res.status(403).json({ data: sendMessage, success: false });
};

const checkEmailStatus = (req, res, next) => {
  const user = req.user;
  if (user?.isEmailVerified) {
    return next();
  }
  const sendMessage = "Please verify your email.";
  return res.status(403).json({ data: sendMessage, success: false });
};

module.exports = { checkStartedStatus, checkEmailStatus };
