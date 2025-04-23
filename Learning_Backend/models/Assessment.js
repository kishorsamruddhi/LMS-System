const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "module",
      required: true,
    },
    primary_text: { type: String, required: true },
    options: { type: [String], required: true, default: [] },
    correct_option: { type: String, required: true },
    assessment_seq_no: { type: Number, default: 0 },
    assessment_status: {
      type: String,
      enum: ["PUBLISHED", "DRAFT", "ARCHIVED"],
      default: "PUBLISHED",
    },
    type: {
      type: String,
      enum: ["YES_NO", "MCQ"],
      // required: true,
      default: "MCQ",
    },
    created_by: { type: Number, default: null },
    updated_by: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

const Assessment = mongoose.model("assessment", assessmentSchema);

module.exports = Assessment;
