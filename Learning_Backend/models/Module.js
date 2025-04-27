const mongoose = require("mongoose");
const modulesSchema = new mongoose.Schema(
  {
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
    module_code: {
      type: String,
      required: true,
    },
    module_name: {
      type: String,
      required: true,
    },
    module_desc: {
      type: String,
    },
    module_seq_no: { type: String, required: true },
    module_type: {
      type: String,
      enum: ["THEORY", "ASSESSMENT"],
      required: true,
    },
    assessments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "assessment",
        },
      ],
      default: [],
    },
    pedagogies: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "pedagogy",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
const Module_Model = mongoose.model("module", modulesSchema);

module.exports = Module_Model;
