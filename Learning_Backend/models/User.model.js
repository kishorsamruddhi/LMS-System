const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: "",
      maxlength: 16,
      require: true,
      unique: true,
    },
    email: { type: String, require: true, unique: true },
    phoneNumber: { type: Number, require: true, maxlength: 12 },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      require: true,
    },
    address: { type: String, maxlength: 60, default: "" },
    password: { type: String, default: "" },
    business_course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institue",
    },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
