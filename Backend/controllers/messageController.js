const Message = require("../models/Message");
const Chat = require("../models/Chat");
const DeletedMessage = require("../models/DeletedMessage");
const imagekit = require("../config/imagekit");

const sendMessage = async (req, res) => {
  try {
    const { chatId, text, replyToId } = req.body; // Capture replyToId

    if (!text && !req.file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    let imageUrl = "";
    if (req.file) {
      const uploadedImage = await imagekit.upload({
        file: req.file.buffer,
        fileName: Date.now() + "-" + req.file.originalname,
        folder: "/chat-app/messages",
      });
      imageUrl = uploadedImage.url;
    }

    // Save with the reply reference attached
    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      text: text || "",
      image: imageUrl,
      replyTo: replyToId || null, 
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    // POPULATE BOTH SENDER AND THE REPLIED MESSAGE PERMANENTLY
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("replyTo", "text image sender"); // Grabs parent text/image

    const receiverId = chat.participants.find((id) => id.toString() !== req.user.id);

    res.status(201).json({
      message: populatedMessage,
      receiverId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const page = Number(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Find messages this user has soft-deleted with "Delete for Me"
    const deletedEntries = await DeletedMessage.find({ user: req.user.id }).select("message");
    const deletedIds = deletedEntries.map((d) => d.message);

    const messages = await Message.find({
      chat: req.params.chatId,
      _id: { $nin: deletedIds },
    })
      .populate("sender", "name avatar")
      .populate("replyTo", "text image") // ALWAYS POPULATE THE PARENT LINK
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
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