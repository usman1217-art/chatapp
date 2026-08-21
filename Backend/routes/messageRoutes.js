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
  reactToMessage,
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

router.post("/:messageId/react", auth, reactToMessage);

module.exports = router;