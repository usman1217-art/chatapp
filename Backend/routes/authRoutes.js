const express = require("express");

const router = express.Router();

const {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post(
  "/reset-password/:token",
  resetPassword
);
router.get("/verify-email/:token", verifyEmail);
module.exports = router;