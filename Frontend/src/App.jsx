import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react"; // 👈 Imported hooks

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/common/ProtectedRoute";
import VoiceCallModal from "./components/chat/VoiceCallModal"; // 👈 Imported Call Modal
import { useSocket } from "./context/SocketContext"; // 👈 Imported Socket Context

function App() {
  const { socket } = useSocket();
  
  // --- GLOBAL INCOMING CALL STATE ---
  const [incomingCall, setIncomingCall] = useState(null);

  // --- GLOBAL INCOMING CALL LISTENER ---
  useEffect(() => {
    if (!socket) return;

    // This listener stays active across all pages (Home, Profile, etc.)
    socket.on("incoming-call", ({ signal, from, name }) => {
      setIncomingCall({
        isCaller: false,
        signal,
        caller: { _id: from, name }
      });
    });

    return () => {
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