const mongoose = require("mongoose");

const learningTimeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "user",
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institue",
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
      default: 0,
    },
    courses: {
      type: [
        {
          course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
            required: true,
          },
          timeSpent: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    modules: {
      type: [
        {
          module_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "module",
            required: true,
          },
          timeSpent: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    pedagogies: {
      type: [
        {
          pedagogy_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pedagogy",
            required: true,
          },
          timeSpent: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    assessments: {
      type: [
        {
          assessment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "assessment",
            required: true,
          },
          timeSpent: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
const LearningTime = mongoose.model("user_learning_time", learningTimeSchema);

module.exports = LearningTime;
