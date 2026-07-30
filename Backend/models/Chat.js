const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
  
      isGroup: {
        type: Boolean,
        default: false,
      },
  
      lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
      },
    },
    { timestamps: true }
  );

module.exports = mongoose.model("Chat", chatSchema);