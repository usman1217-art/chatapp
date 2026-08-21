const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const upload = require("../middleware/upload");

const {

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
  sendFriendRequest

} = require("../controllers/userController");

// Friend Management Routes
router.get("/friends", auth, getFriends);
router.post("/friends", auth, addFriend);
router.delete("/friends/:friendId", auth, removeFriend);

// Friend Request Routes
router.get("/friend-requests", auth, getFriendRequests);
router.post("/friend-request", auth, sendFriendRequest);
router.post("/friend-request/accept", auth, acceptFriendRequest);
router.delete("/friend-request/:senderId", auth, async (req, res) => {
  try {
    const { senderId } = req.params;
    const userId = req.user.id;

    // Decline / Delete incoming request and clear outgoing reference
    await User.findByIdAndUpdate(userId, {
      $pull: { friendRequests: senderId },
    });
    await User.findByIdAndUpdate(senderId, {
      $pull: { sentRequests: userId },
    });

    res.status(200).json({ message: "Friend request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search and Profile Routes
router.get("/search", auth, searchUsers);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

router.put(
    "/change-password",
    auth,
    changePassword
  );

router.put(
  "/profile-image",
  auth,
  upload.single("image"),
  uploadProfileImage
);

module.exports = router;