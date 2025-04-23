const mongoose = require("mongoose");

const assessmentResponseSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "module",
      required: true,
    },
    assessment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assessment",
      required: true,
    },
    history: {
      type: [
        {
          user_option: String,
          date: Date,
          isCorrect: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
    isCorrect: { type: Boolean, required: true },
    completeDate: {
      type: Date,
      default: null,
    },
    isSkip: { type: Boolean, required: true, default: false },
    user_option: { type: String, required: true },
    correct_option: { type: String, required: true },
  },
  { timestamps: true }
);

assessmentResponseSchema.pre("save", function (next) {
  if (this.isCorrect && !this.isCorrect) {
    this.completeDate = new Date();
  }
  next();
});

const AssessmentReport = mongoose.model(
  "user_assessment",
  assessmentResponseSchema
);

module.exports = AssessmentReport;
