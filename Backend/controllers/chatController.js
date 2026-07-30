const Chat = require("../models/Chat");
const Message = require("../models/Message");

const createChat = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (receiverId === req.user.id) {
      return res.status(400).json({
        message: "Cannot chat with yourself"
      });
    }

    let chat = await Chat.findOne({
      participants: {
        $all: [req.user.id, receiverId],
      },
      isGroup: false,
    })
      .populate("participants", "-password")
      .populate("lastMessage");

    if (chat) {
      return res.status(200).json(chat);
    }

    chat = await Chat.create({
      participants: [req.user.id, receiverId],
    });

    chat = await Chat.findById(chat._id)
      .populate("participants", "-password");

    res.status(201).json(chat);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
    })
      .populate("participants", "-password")
      .populate("lastMessage");

    res.json(chats);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user._id || req.user.id; 

    console.log("Attempting to delete Chat:", chatId, "by User:", userId);

    // Find chat checking participants safely
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chat) {
      console.log("Chat validation failed: Not found or user unauthorized");
      return res.status(404).json({ message: "Chat not found or unauthorized" });
    }

    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    console.log("Chat deleted successfully:", chatId);
    res.status(200).json({ message: "Chat deleted successfully", chatId });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ message: "Server error while deleting chat" });
  }
};

module.exports = {
  createChat,
  getChats,
  deleteChat
};