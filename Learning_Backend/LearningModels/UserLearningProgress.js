const mongoose = require("mongoose");

const user_report_card = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },
  business_course_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "business_courses",
    default: null,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  completeDate: {
    type: Date,
    default: null,
  },
  total_courses_count: {
    type: Number,
    default: 0,
  },
  complete_courses_count: {
    type: Number,
    default: 0,
  },
  learning_courses: {
    type: [
      {
        source_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "course",
        },
        user_record: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user_learning_course",
        },
      },
    ],
    default: [],
    _id: false,
  },
  completed_courses: {
    type: [
      {
        source_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "course",
        },
        user_record: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user_learning_course",
        },
      },
    ],
    default: [],
    _id: false,
  },
});

user_report_card.pre("save", function (next) {
  if (this.isComplete && !this.completeDate) {
    this.completeDate = new Date();
  }
  next();
});
const UserReportCard = mongoose.model(
  "user_learning_Progress",
  user_report_card
);
module.exports = UserReportCard;
