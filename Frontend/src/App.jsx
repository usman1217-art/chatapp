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
import VoiceCallModal from "./components/chat/VoiceCallModal";
import { useSocket } from "./context/SocketContext";

function App() {
  const { socket } = useSocket();
  
  // --- GLOBAL INCOMING CALL STATE ---
  const [incomingCall, setIncomingCall] = useState(null);

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

  // --- GLOBAL SOCKET NOTIFICATION LISTENERS ---
  useEffect(() => {
    if (!socket) return;

    // 1. Listen for background text messages
    socket.on("receiveMessage", (message) => {
      // Trigger a system alert ONLY if the user is currently tabbed out
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
    });

    // 2. Listen for background voice calls
    socket.on("incoming-call", ({ signal, from, name, avatar }) => { // 👈 Make sure avatar is destructured here
      setIncomingCallData({
        signal,
        caller: {
          _id: from,
          name: name,
          avatar: avatar // 👈 Make sure it gets passed into the modal's receiver prop!
        }
      });
    });
      // Trigger a lingering push alert if tabbed out
      if (document.hidden && Notification.permission === "granted") {
        const callNotification = new Notification(`📞 Incoming Call`, {
          body: `${name} is calling you...`,
          requireInteraction: true, // Persists on screen until interacted with
        });

        callNotification.onclick = (e) => {
          e.preventDefault();
          window.focus();
          callNotification.close();
        };
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("incoming-call");
    };
  }, [socket]);

  return (
    // Global App Wrapper for the Dark Navy Theme
    <div className="min-h-screen bg-[#0a192f] text-slate-200 transition-colors duration-300 font-sans selection:bg-indigo-500/30">
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

      {/* --- GLOBAL INCOMING VOICE CALL OVERLAY PANEL --- */}
      {incomingCall && (
        <VoiceCallModal
          receiver={incomingCall.caller}
          isCaller={false}
          incomingSignal={incomingCall.signal}
          onClose={() => setIncomingCall(null)}
        />
      )}
    </div>
  );
}

export default App;