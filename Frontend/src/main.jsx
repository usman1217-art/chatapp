import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext"; // 👈 IMPORT ADDED HERE

import App from "./App";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* 👈 THEME PROVIDER WRAPS THE APP */}
      <ThemeProvider> 
        <AuthProvider>
          <ChatProvider>
            <SocketProvider>
              
              {/* Optional: You can remove the hardcoded dark style from Toaster later 
                  if you want the toasts to change color in Light Mode! */}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#0f172a",
                    color: "#e2e8f0",
                    border: "1px solid #1e293b",
                    borderRadius: "10px",
                    fontSize: "14px",
                  },
                }}
              />

              <App />

            </SocketProvider>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);