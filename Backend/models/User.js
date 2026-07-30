const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "Hey there! I am using Chat App.",
      maxLength: 150,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Incoming requests
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],     // Outgoing requests
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: "",
    },
    
    verificationTokenExpires: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);