const mongoose = require("mongoose");

const learnerSub = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    learner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_learning_Progress",
      required: true,
    },
    sub_pack_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscription_packs",
      required: true,
    },
    business_course_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Institue",
    },
    plan_code: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      default: "CashFree Payment",
    },
    transactionId: {
      type: String,
    },
    endTime: {
      type: Date,
      required: true,
      default: function () {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 30 days from current time
      },
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Super_Admin",
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Super_Admin",
    },
  },
  { timestamps: true }
);

const Learner_SubscriptionPlan = mongoose.model(
  "learner_subscription_plan",
  learnerSub
);

module.exports = Learner_SubscriptionPlan;
