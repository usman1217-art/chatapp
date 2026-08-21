const User = require("../models/User");
const imagekit = require("../config/imagekit");
const bcrypt = require("bcrypt");

// Get logged-in user's friends list
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friends", "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a friend directly
const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    if (friendId === userId) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    const user = await User.findById(userId);
    const friendUser = await User.findById(friendId);

    if (!user || !friendUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
    }

    if (!friendUser.friends.includes(userId)) {
      friendUser.friends.push(userId);
      await friendUser.save();
    }

    const updatedUser = await User.findById(userId).populate("friends", "-password");
    res.status(200).json(updatedUser.friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unfriend
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    res.status(200).json({ message: "Unfriended successfully", friendId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // We need the password field, so don't exclude it here or use findById with select('+password') if it was excluded by default.
    // It's not excluded by default in schema, so findById is fine.
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user has an existing password, verify it
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.clearCookie("refreshToken");
    res.json({ message: "Password updated successfully. Please login again." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search user strictly by formatted User ID (e.g. CHAT-M3FFBX)
const searchUsers = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const formattedQuery = userId.trim().toUpperCase();

    const user = await User.findOne({
      userId: formattedQuery,
      _id: { $ne: req.user.id },
    }).select("-password -refreshTokens");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user has a password set
    const hasPassword = !!user.password;
    
    const userObj = user.toObject();
    delete userObj.password;
    userObj.hasPassword = hasPassword;

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    // 1. Add 'avatar' to the destructured fields
    const { name, about, avatar } = req.body; 
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (about !== undefined) user.about = about;
    
    // 2. Allow updating the avatar (even if it's an empty string to delete it)
    if (avatar !== undefined) {
      user.avatar = avatar; 
    }

    await user.save();
    
    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: Date.now() + "-" + req.file.originalname,
      folder: "/chat-app/profile-images",
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = result.url;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send a friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    if (friendId === userId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const receiver = await User.findById(friendId);
    const sender = await User.findById(userId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver.friendRequests.includes(userId) || sender.friends.includes(friendId)) {
      return res.status(400).json({ message: "Request already sent or already friends" });
    }

    receiver.friendRequests.push(userId);
    await receiver.save();

    sender.sentRequests.push(friendId);
    await sender.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept a friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friendRequests.includes(senderId)) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== userId);

    if (!user.friends.includes(senderId)) user.friends.push(senderId);
    if (!sender.friends.includes(userId)) sender.friends.push(userId);

    await user.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending incoming friend requests
const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friendRequests", "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.friendRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete User Account
const DeletedAccount = require("../models/DeletedAccount");

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "You must set a password in your Security settings before you can delete your account." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete your account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Archive user
    await DeletedAccount.create({
      originalUserId: user.userId,
      originalId: user._id.toString(),
      name: user.name,
      email: user.email,
      about: user.about,
    });

    // Remove user references from other users' arrays
    await User.updateMany(
      { 
        $or: [
          { friends: userId },
          { friendRequests: userId },
          { sentRequests: userId }
        ]
      },
      {
        $pull: {
          friends: userId,
          friendRequests: userId,
          sentRequests: userId
        }
      }
    );

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  searchUsers,
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
  getFriends,
  addFriend,
  removeFriend,
  getFriendRequests,
  acceptFriendRequest,
  sendFriendRequest,
  deleteAccount,
};