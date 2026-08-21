const mongoose = require("mongoose");

const deletedAccountSchema = new mongoose.Schema(
  {
    originalUserId: {
      type: String,
      required: true,
    },
    originalId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model("DeletedAccount", deletedAccountSchema);
