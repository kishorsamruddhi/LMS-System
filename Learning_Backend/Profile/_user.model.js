const mongoose = require("mongoose");

const unknownMessageSchema = new mongoose.Schema(
  {
    username: { type: String, maxlength: 36, minlength: 4 },
    text: {
      type: String,
      required: true,
    },
    sendedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const connectedToSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 36,
      minlength: 4,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      maxlength: 36,
      minlength: 6,
    },
    connectedTo: [connectedToSchema],
    unknownChat: [unknownMessageSchema],
    listeningCode: {
      type: String,
      required: true,
      unique: true,
    },
    listenLinks: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "A user can have a maximum of 5 URLs.",
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
