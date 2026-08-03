const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    read: {
      type: Boolean,
      default: false,
    },

    deletedForEveryone: {
      type: Boolean,
      default: false,
    },

    // --- ADD THIS TO LINK REPLIES PERMANENTLY ---
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // --------------------------------------------
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);