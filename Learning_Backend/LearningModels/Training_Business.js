const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  business_name: {
    type: String,
    required: true,
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },
  parent_business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "businesses",
    required: true,
    unique: true,
  },
  business_desc: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  category: {
    type: String,
    required: true,
  },
  isCommonCourse: {
    type: Boolean,
  },
  courses: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
        required: true,
      },
    ],
    default: [],
  },
});

const BusinessCourses = mongoose.model("business_courses", moduleSchema);

module.exports = BusinessCourses;
