const mongoose = require("mongoose");

const unknownMessageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    username: { type: String },
  },
  { _id: false, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    connectedTo: [
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
    ],
    unknown: [unknownMessageSchema],
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
