import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

function VoiceCallModal({ receiver, onClose, isCaller, incomingSignal }) {
  const { socket } = useSocket();
  const { user } = useAuth();

  // --- NEW: Track whether the incoming call has been accepted ---
  const [isCallAccepted, setIsCallAccepted] = useState(isCaller);
  const [callStatus, setCallStatus] = useState(isCaller ? "Calling..." : "Incoming Voice Call");
  const [isMuted, setIsMuted] = useState(false);

  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const receiverId = receiver?._id || receiver;
  const receiverName = typeof receiver === "object" ? receiver?.name : "User";
  const receiverAvatar = typeof receiver === "object" ? receiver?.avatar : null;

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Handle WebRTC Setup Flow
  useEffect(() => {
    // Only run WebRTC negotiation if the call is outgoing, or if the incoming call was accepted
    if (!isCallAccepted) return;

    let pc = null;
    let localStream = null;

    const startCallFlow = async () => {
      try {
        setCallStatus(isCaller ? "Calling..." : "Connecting...");
        
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = localStream;

        pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && receiverId) {
            socket.emit("ice-candidate", {
              to: receiverId,
              candidate: event.candidate,
            });
          }
        };

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("call-user", {
            userToCall: receiverId,
            signalData: offer,
            from: user._id,
            name: user.name,
          });
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingSignal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("answer-call", {
            signal: answer,
            to: receiverId,
          });
          setCallStatus("Connected");
        }

        socket.on("call-accepted", async (signal) => {
          setCallStatus("Connected");
          if (pc && pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
          }
        });

        socket.on("ice-candidate", async (candidate) => {
          if (pc && candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error("Error adding received ice candidate", e);
            }
          }
        });

      } catch (err) {
        console.error("Failed to initialize WebRTC audio stream:", err);
        setCallStatus("Mic permission denied or error");
        setTimeout(cleanupAndClose, 2500);
      }
    };

    startCallFlow();

    return () => {
      // Shared socket listeners cleanup handled in the main component unmount hook
    };
  }, [isCallAccepted]);

  // Handle high-level signaling status termination listeners
  useEffect(() => {
    socket.on("hangup", () => {
      cleanupAndClose();
    });

    return () => {
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("hangup");
    };
  }, []);

  const handleAcceptCall = () => {
    setIsCallAccepted(true);
  };

  const handleDeclineCall = () => {
    cleanupAndClose();
  };

  const cleanupAndClose = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (receiverId) {
      socket.emit("hangup", { to: receiverId });
    }
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const displayAvatar = receiverAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverName)}&background=4f46e5&color=fff`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 dark:bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl w-full max-w-[320px] rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/50 dark:border-slate-700/50 flex flex-col items-center p-8 text-center animate-scale-up">
        
        {/* Pulsing Avatar Container */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-full border-2 border-indigo-500/40 animate-ping"></div>
          <img
            src={displayAvatar}
            alt={receiverName}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl relative z-10 bg-slate-200"
          />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1 truncate max-w-full">
          {receiverName}
        </h3>
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-8">
          {callStatus}
        </p>

        {/* --- CONDITIONAL ACTION CONTROLS --- */}
        <div className="flex items-center gap-5 w-full justify-center">
          {!isCallAccepted ? (
            /* --- RINGING PANEL: SHOW ATTEND OR DECLINE BUTTONS --- */
            <>
              {/* Decline Button */}
              <button
                onClick={handleDeclineCall}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all transform active:scale-95 cursor-pointer rotate-[135deg]"
                title="Decline Call"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>

              {/* Accept Button */}
              <button
                onClick={handleAcceptCall}
                className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all transform active:scale-95 cursor-pointer animate-pulse"
                title="Accept Call"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </>
          ) : (
            /* --- LIVE CALL PANEL: SHOW MUTE AND HANGUP CONTROLS --- */
            <>
              {callStatus === "Connected" && (
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full shadow-lg transition-all cursor-pointer ${
                    isMuted 
                      ? "bg-amber-500 text-white hover:bg-amber-600" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title={isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}

              <button
                onClick={cleanupAndClose}
                className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all transform active:scale-95 cursor-pointer rotate-[135deg]"
                title="End Call"
              >
                <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default VoiceCallModal;