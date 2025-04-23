const mongoose = require("mongoose");

const pedagogyResponseSchema = new mongoose.Schema(
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
    pedagogy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pedagogy",
      required: true,
    },
    isCompleted: { type: Boolean, required: true },
    completeDate: {
      type: Date,
      default: null,
    },
    learning_sec: {
      type: Number,
      default: 0,
    },
    max_learning_sec: {
      type: Number,
      default: 0,
    },
    total_time_spent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

pedagogyResponseSchema.pre("save", function (next) {
  if (this.isCompleted && !this.isCompleted) {
    this.completeDate = new Date();
  }
  next();
});

const AssessmentResponse = mongoose.model(
  "user_pedagogy",
  pedagogyResponseSchema
);

module.exports = AssessmentResponse;
