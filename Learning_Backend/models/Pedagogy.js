const mongoose = require("mongoose");

const pedagogySchema = new mongoose.Schema(
  {
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "module",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institue",
      required: true,
    },
    pedagogy_type: {
      type: String,
      enum: ["VIDEO", "H5P"],
      default: "VIDEO",
      required: true,
    },
    text: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    // embed_code: { type: String, default: null },
    avg_time: { type: Number, required: false, default: 12 },
    pedagogy_seq_no: { type: String, default: 0 },
    pedagogy_status: {
      type: String,
      enum: ["PUBLISHED", "DRAFT"],
      default: "PUBLISHED",
    },
  },
  { timestamps: true }
);

// Create a model from the schema
const Pedagogy = mongoose.model("pedagogy", pedagogySchema);

module.exports = Pedagogy;
