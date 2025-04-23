const mongoose = require("mongoose");

const learningModuleSchema = new mongoose.Schema(
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
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "learning_course",
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
    total_child_count: {
      type: Number,
      default: 0,
    },
    complete_child_count: {
      type: Number,
      default: 0,
    },
    // module_type: {
    //   type: String,
    //   enum: ["THEORY", "ASSESSMENT"],
    //   required: true,
    // },
    completed_Assessments: {
      type: [
        {
          source_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "assessment",
          },
          user_record: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_assessment",
          },
          _id: false,
        },
      ],
    },
    completed_pedagoggies: {
      type: [
        {
          source_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pedagogy",
          },
          user_record: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_pedagogy",
          },
          _id: false,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

learningModuleSchema.pre("save", function (next) {
  if (this.isComplete && !this.completeDate) {
    this.completeDate = new Date();
  }
  next();
});

const UserModuleReport = mongoose.model(
  "user_learning_module",
  learningModuleSchema
);

module.exports = UserModuleReport;
