const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userId;

    while (true) {
      userId =
        "CHAT-" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      const exists = await User.findOne({ userId });

      if (!exists) break;
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userId,
      isVerified: false,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires:
        Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // REPLACED TRANSPORTER WITH RESEND:
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Welcome to Chat App</h2>
        <p>Please verify your email.</p>
        <a href="${verifyLink}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};
// ================= LOGIN =================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Email verification check
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token (supports multiple devices)
    user.refreshTokens.push({
      token: refreshToken,
    });

    await user.save();

    const isProduction = process.env.NODE_ENV === "production";

    // Send refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Remove sensitive fields
    const userResponse = await User.findById(user._id).select(
      "-password -refreshTokens -verificationToken -resetPasswordToken"
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: userResponse,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ================= GOOGLE LOGIN =================

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({
      email: payload.email,
    });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: "",
        avatar: payload.picture,
        isGoogleUser: true,
      });
    }

    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
    const userResponse = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    res.json({
      accessToken,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ================= REFRESH TOKEN =================
// ================= REFRESH TOKEN =================
const refreshAccessToken = async (req, res) => {
  console.log("===== REFRESH CALLED =====");

  try {
    const refreshToken = req.cookies.refreshToken;

    console.log("COOKIE:", refreshToken);

    if (!refreshToken) {
      console.log("NO COOKIE");
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    console.log("DECODED:", decoded);

    const user = await User.findById(decoded.id);

    console.log("USER:", user?._id);

    console.log("TOKENS:", user?.refreshTokens);

    const exists = user.refreshTokens.some(
      (item) => item.token === refreshToken
    );

    console.log("EXISTS:", exists);

    if (!exists) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken(user._id);

    console.log("SUCCESS");

    return res.json({ accessToken });

  } catch (err) {
    console.log("ERROR:", err.message);
    return res.status(401).json({
      message: err.message,
    });
  }
};
// ================= LOGOUT =================

const logout = async (req, res) => {
  try {

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const user = await User.findById(decoded.id);

      if (user) {

        user.refreshTokens =
          user.refreshTokens.filter(
            (item) => item.token !== refreshToken
          );

        await user.save();
      }

    }

    res.clearCookie("refreshToken");

    res.json({
      message: "Logged out successfully",
    });

  } catch (err) {

    res.clearCookie("refreshToken");

    res.json({
      message: "Logged out successfully",
    });

  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Don't reveal whether the email exists
    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store hashed token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // REPLACED TRANSPORTER WITH RESEND:
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // 1. MUST HASH THE INCOMING TOKEN TO MATCH THE DATABASE!
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Query using the hashed token and check expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Logout all devices

    await user.save();

    res.json({
      message: "Password reset successful. Please login again.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {

    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    user.isVerified = true;
    user.verificationToken = "";
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
};

module.exports = {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
