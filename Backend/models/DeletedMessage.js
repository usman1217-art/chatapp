const mongoose = require("mongoose");

const deletedMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

deletedMessageSchema.index(
  { user: 1, message: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "DeletedMessage",
  deletedMessageSchema
);