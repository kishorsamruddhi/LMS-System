const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "business_courses",
      required: true,
    },
    course_pack_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscription_packs",
      required: true,
    },
    course_code: {
      type: String,
      required: true,
    },
    subscription_lvl: {
      type: Number,
      default: 1,
      min: [1, "Subscription level must be greater than 0"],
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && value > 0;
        },
        message: "Subscription level must be a natural number greater than 0",
      },
    },
    course_name: {
      type: String,
      required: true,
    },
    course_desc: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    course_status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
    modules: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "module",
          required: true,
        },
      ],
      default: [],
    },
    course_seq_no: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a model from the schema
const Course = mongoose.model("course", courseSchema);

module.exports = Course;
