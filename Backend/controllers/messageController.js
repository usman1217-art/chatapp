const Message = require("../models/Message");
const Chat = require("../models/Chat");
const DeletedMessage = require("../models/DeletedMessage");
const imagekit = require("../config/imagekit");

const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    // Don't allow empty messages
    if (!text && !req.file) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    // Check chat exists
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Check user belongs to chat
    if (
      !chat.participants.some(
        (id) => id.toString() === req.user.id
      )
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadedImage = await imagekit.upload({
        file: req.file.buffer,
        fileName: Date.now() + "-" + req.file.originalname,
        folder: "/chat-app/messages",
      });

      imageUrl = uploadedImage.url;
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      text: text || "",
      image: imageUrl,
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    const receiverId = chat.participants.find(
      (id) => id.toString() !== req.user.id
    );

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar");

    res.status(201).json({
      message: populatedMessage,
      receiverId,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.body;

    const alreadyDeleted = await DeletedMessage.findOne({
      user: req.user.id,
      message: messageId,
    });

    if (alreadyDeleted) {
      return res.json({
        success: true,
      });
    }

    await DeletedMessage.create({
      user: req.user.id,
      message: messageId,
    });

    res.json({
      success: true,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    if (
      !chat.participants.some(
        (id) => id.toString() === req.user.id
      )
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const deletedMessages = await DeletedMessage.find({
      user: req.user.id,
    });

    const deletedIds = deletedMessages.map(
      (item) => item.message
    );

    // Pagination
    const page = Number(req.query.page) || 1;

    const limit = 30;

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      chat: req.params.chatId,
      _id: { $nin: deletedIds },
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    // Return oldest → newest for the UI
    res.json(messages.reverse());

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {

    const { messageId } = req.body;

    await Message.findByIdAndUpdate(messageId, {
      read: true,
    });

    res.json({
      success: true,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteForEveryone = async (req, res) => {
  try {

    const { messageId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Allow deletion only within 15 minutes
    const diff =
      (Date.now() - message.createdAt.getTime()) /
      1000 /
      60;

    if (diff > 15) {
      return res.status(400).json({
        message: "Delete time expired",
      });
    }

    message.deletedForEveryone = true;

    await message.save();

    const chat = await Chat.findById(message.chat);

    const receiverId = chat.participants.find(
      (id) => id.toString() !== req.user.id
    );

    res.json({
      messageId,
      receiverId,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  deleteForEveryone,
  deleteForMe,
};