const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createChat,
  getChats,
  deleteChat
} = require("../controllers/chatController");

// 1. Place the parameter delete route FIRST so Express catches it immediately
router.delete("/:id", auth, deleteChat);

// 2. Then place your standard static routes
router.post("/", auth, createChat);
router.get("/", auth, getChats);

module.exports = router;