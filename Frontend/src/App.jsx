import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/common/ProtectedRoute";
import { useSocket } from "./context/SocketContext";
import { useAppTheme } from "./context/ThemeContext";

function App() {
  const { theme, colorScheme } = useAppTheme();
  const { socket } = useSocket();

  // --- AUTOMATED BROWSER NOTIFICATION PERMISSION REQUEST ---
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (!("Notification" in window)) {
        console.log("This browser does not support desktop alerts.");
        return;
      }
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    };
    requestNotificationPermission();
  }, []);

  // --- GLOBAL SOCKET NOTIFICATION LISTENERS (browser alerts only) ---
  useEffect(() => {
    if (!socket) return;

    // Background text message browser notification
    const handleBackgroundMessage = (message) => {
      if (document.hidden && Notification.permission === "granted") {
        const notification = new Notification(`New Message`, {
          body: message.text || "📷 Sent an attachment",
          tag: "chat-msg-alert",
          renotify: true,
        });

        notification.onclick = (e) => {
          e.preventDefault();
          window.focus();
          notification.close();
        };
      }
    };

    // Background voice call browser notification
    const handleBackgroundCall = ({ signal, from, name, avatar }) => {
      if (document.hidden && Notification.permission === "granted") {
        const callNotification = new Notification(`📞 Incoming Call`, {
          body: `${name} is calling you...`,
          requireInteraction: true,
        });

        callNotification.onclick = (e) => {
          e.preventDefault();
          window.focus();
          callNotification.close();
        };
      }
    };

    socket.on("receiveMessage", handleBackgroundMessage);
    socket.on("incoming-call", handleBackgroundCall);

    return () => {
      socket.off("receiveMessage", handleBackgroundMessage);
      socket.off("incoming-call", handleBackgroundCall);
    };
  }, [socket]);


  return (
    // Global App Wrapper with dynamic background
    <div 
      className="min-h-screen text-slate-200 transition-colors duration-300 font-sans selection:bg-slate-500/30"
    >

      <div className="relative z-10 h-full flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>

      </div>
    </div>
  );
}

export default App;