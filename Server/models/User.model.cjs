const mongoose = require("mongoose");

// Validator function for username
function usernameValidator(v) {
  const regex = /^[a-z][a-z0-9]{4,13}$/; // Starts with a lowercase letter, followed by 4-13 lowercase letters or digits
  return regex.test(v);
}

// Validator function for password

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: usernameValidator,
        message: (props) =>
          `${props.value} is not a valid username! Must be 5-14 characters long, start with a lowercase letter, and contain only lowercase letters and numbers.`,
      },
    },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
    },
    googleId: { type: String },
    githubId: { type: String },
    bio: { type: String, default: "" },
    country: { type: String, default: "" },
    // agreeToTerms: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
