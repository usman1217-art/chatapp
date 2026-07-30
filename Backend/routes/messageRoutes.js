const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  sendMessage,
  getMessages,
  markAsRead,
  deleteForEveryone,
  deleteForMe,
} = require("../controllers/messageController");

router.post(
  "/",
  auth,
  upload.single("image"),
  sendMessage
);

router.get("/:chatId", auth, getMessages);

router.patch("/read", auth, markAsRead);

router.patch("/delete-me", auth, deleteForMe);

router.patch(
  "/delete-everyone",
  auth,
  deleteForEveryone
);

module.exports = router;