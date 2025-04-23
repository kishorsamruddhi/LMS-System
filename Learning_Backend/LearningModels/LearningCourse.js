const mongoose = require("mongoose");

const learningCourseSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    completeDate: {
      type: Date,
      default: null,
    },
    total_module_count: {
      type: Number,
      default: 0,
    },
    complete_module_count: {
      type: Number,
      default: 0,
    },
    learning_Modules: {
      type: [
        {
          source_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "module",
          },
          user_record: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_learning_module",
          },
        },
      ],
      default: [],
      _id: false,
    },
    completed_Modules: {
      type: [
        {
          source_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "module",
          },
          user_record: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_learning_module",
          },
        },
      ],
      default: [],
      _id: false,
    },
  },
  { timestamps: true }
);

learningCourseSchema.pre("save", function (next) {
  if (this.isComplete && !this.completeDate) {
    this.completeDate = new Date();
  }
  next();
});

const UserCourseReport = mongoose.model(
  "user_learning_course",
  learningCourseSchema
);

module.exports = UserCourseReport;
