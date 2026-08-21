import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import Cropper from "react-easy-crop";

// --- UTILITY FUNCTIONS FOR CROPPING ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
};
// --------------------------------------


function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", about: "" });
  const [isSaving, setIsSaving] = useState(false);
  
  // --- PASSWORD STATE ---
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ show: false, message: "", onConfirm: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, password: "" });
  const [statusMessage, setStatusMessage] = useState("");

  // --- CROPPER STATE ---
  const [cropModal, setCropModal] = useState({ show: false, imageSrc: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  // 🔴 FIX: Extracted `logout` from useAuth so we can actually destroy backend cookies
  const { logout, setUser: setGlobalUser } = useAuth(); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken"); 
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setEditForm({ name: data.name, about: data.about || "" });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const triggerToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleCopyId = () => {
    if (user?.userId) {
      navigator.clipboard.writeText(user.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- IMAGE SELECTION & CROPPING LOGIC ---
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropModal({ show: true, imageSrc: reader.result });
    });
    reader.readAsDataURL(file);
    
    e.target.value = null; 
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    setIsUploading(true);
    try {
      const croppedFile = await getCroppedImg(cropModal.imageSrc, croppedAreaPixels);

      const localImageUrl = URL.createObjectURL(croppedFile);
      setUser((prev) => ({ ...prev, avatar: localImageUrl }));
      setCropModal({ show: false, imageSrc: null });
      setZoom(1); 

      const formData = new FormData();
      formData.append("image", croppedFile);

      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile-image`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        triggerToast("Avatar updated successfully!");
      } else {
        triggerToast("Failed to upload avatar on server.");
      }
    } catch (error) {
      console.error("Error cropping/uploading image:", error);
      triggerToast("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelCrop = () => {
    setCropModal({ show: false, imageSrc: null });
    setZoom(1);
  };
  // ------------------------------------------

  const handleDeletePhoto = (e) => {
    e.stopPropagation(); 
    
    setConfirmModal({
      show: true,
      message: "Are you sure you want to remove your profile picture?",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ avatar: "" }),
          });

          if (response.ok) {
            const updatedUser = await response.json();
            setUser(updatedUser);
            triggerToast("Profile picture removed.");
          }
        } catch (error) {
          console.error("Error removing profile image:", error);
        }
        setConfirmModal({ show: false, message: "", onConfirm: null });
      }
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        triggerToast("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      const payload = { newPassword: passwordForm.newPassword };
      if (user.hasPassword) {
        payload.currentPassword = passwordForm.currentPassword;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast("Password updated successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "" });
        // Update local user state to reflect they now have a password
        setUser((prev) => ({ ...prev, hasPassword: true }));
      } else {
        triggerToast(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      triggerToast("An error occurred.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      show: true,
      message: "Are you sure you want to sign out?",
      onConfirm: async () => {
        try {
          if (logout) {
            await logout();
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            if (setGlobalUser) setGlobalUser(null);
          }
        } catch (error) {
          console.error("Logout failed", error);
        } finally {
          setConfirmModal({ show: false, message: "", onConfirm: null });
          navigate("/login", { replace: true });
        }
      }
    });
  };

  const confirmDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ password: deleteModal.password })
      });

      if (response.ok) {
        if (logout) {
          await logout();
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          if (setGlobalUser) setGlobalUser(null);
        }
        setDeleteModal({ show: false, password: "" });
        navigate("/register", { replace: true });
      } else {
        const data = await response.json();
        triggerToast(data.message || "Failed to delete account");
        setDeleteModal((prev) => ({ ...prev, show: false }));
      }
    } catch (error) {
      console.error("Delete account failed", error);
      setDeleteModal({ show: false, password: "" });
    }
  };

  const handleDeleteAccount = () => {
    if (!user.hasPassword) {
      triggerToast("You must set a password in the Security section first.");
      return;
    }
    setDeleteModal({ show: true, password: "" });
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50 dark:bg-transparent transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0a192f] text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300">
        Unable to load profile data.
      </div>
    );
  }

  const displayAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=256`;

  return (
      <div className="flex-1 flex flex-col items-center pt-6 pb-10 h-screen overflow-y-auto bg-transparent transition-colors duration-300 px-4 relative">
      
      {/* Toast Feedback */}
      {statusMessage && (
        <div className="absolute top-4 z-40 px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 border border-slate-700 dark:border-slate-200 text-xs font-bold rounded-xl shadow-lg animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* --- CROP IMAGE MODAL --- */}
      {cropModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#050505] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] sm:h-[600px] animate-slide-up border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#050505] z-10">
              <h3 className="text-slate-800 dark:text-slate-100 font-bold text-lg tracking-tight">Adjust Avatar</h3>
              <button onClick={cancelCrop} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            {/* Cropper Container */}
            <div className="relative flex-1 bg-black/5 dark:bg-black/40">
              <Cropper
                image={cropModal.imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            {/* Controls & Footer */}
            <div className="p-5 bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4 z-10">
              <div className="flex items-center gap-4 px-2">
                <span className="text-slate-500 text-sm">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full accent-slate-800 dark:accent-white cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={cancelCrop} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-semibold transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleCropSave} 
                  disabled={isUploading} 
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl font-bold flex items-center shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isUploading ? "Uploading..." : "Save Picture"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ------------------------ */}


      {/* Custom Confirmation Modal Overlay */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#050505] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-xl">
            <h4 className="text-slate-800 dark:text-slate-100 font-bold text-base mb-3">Confirm Action</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setConfirmModal({ show: false, message: "", onConfirm: null })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        
        {/* Navigation / Header Row */}
        <div className="flex justify-between items-center mb-6 px-1">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chats
          </Link>

          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-sm font-bold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ name: user.name, about: user.about || "" });
                }}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                className="text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center cursor-pointer"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Settings Card */}
        <div className="glass-panel w-full p-8 rounded-2xl transition-all duration-300">
          
          <h2 className="text-2xl font-black text-center text-slate-800 dark:text-slate-100 mb-8 tracking-tight">
            Profile Settings
          </h2>

          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group w-32 h-32">
              <div 
                className="w-full h-full rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                onClick={handlePhotoClick}
              >
                <img 
                  src={displayAvatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60 bg-white"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-300 rounded-full">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              {user.avatar && (
                <button
                  onClick={handleDeletePhoto}
                  className="absolute bottom-0 right-0 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md hover:scale-110 transition-all border-2 border-slate-100 dark:border-slate-900 cursor-pointer z-10"
                  title="Remove Avatar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-slate-900 dark:text-white font-bold tracking-wide uppercase cursor-pointer hover:underline" onClick={handlePhotoClick}>
              Change Avatar
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none transition-all"
                />
              ) : (
                <div className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 font-semibold shadow-sm">
                  {user.name}
                </div>
              )}
            </div>

            {/* About */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                About
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.about}
                  onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                  rows="3"
                  maxLength="150"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none transition-all resize-none"
                />
              ) : (
                <div className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-medium min-h-[88px] whitespace-pre-wrap break-words shadow-sm">
                  {user.about || <span className="text-slate-400 dark:text-slate-500 italic">No description details provided.</span>}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-slate-200/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed select-none">
                {user.email}
              </div>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                User ID
              </label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                <div className="flex-1 px-4 py-3 bg-slate-100 dark:bg-black/40 text-slate-700 dark:text-slate-300 font-mono text-sm truncate select-all">
                  {user.userId}
                </div>
                <button
                  onClick={handleCopyId}
                  className={`px-5 py-3 text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center min-w-[110px] select-none cursor-pointer ${
                    copied 
                      ? "bg-green-600 text-white" 
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                  }`}
                >
                  {copied ? "Copied!" : "Copy ID"}
                </button>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 my-8" />
            
            {/* Security Section */}
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Security</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-slate-100/50 dark:bg-black/20 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                {!user.hasPassword && (
                  <div className="mb-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                    You signed in with Google. Set a password here if you'd like to sign in with email and password in the future.
                  </div>
                )}
                
                {user.hasPassword && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none transition-all"
                      placeholder="Enter current password"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none transition-all"
                    placeholder="At least 6 characters"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword || !passwordForm.newPassword || (user.hasPassword && !passwordForm.currentPassword)}
                    className="px-5 py-2.5 text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isChangingPassword ? "Saving..." : (user.hasPassword ? "Change Password" : "Set Password")}
                  </button>
                </div>
              </form>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 my-6" />
            
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>

            {/* Danger Zone */}
            <div className="pt-2 border-t border-red-200 dark:border-red-900/30">
              <h3 className="text-sm font-bold text-red-600 dark:text-red-500 mb-3 uppercase tracking-wider">Danger Zone</h3>
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-800/30 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>
      {/* Delete Account Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 dark:border-red-900/50 animate-scale-up">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Account</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you absolutely sure? This action will permanently delete your account and cannot be undone. Enter your password to confirm.
            </p>
            
            <input
              type="password"
              placeholder="Enter your password"
              value={deleteModal.password}
              onChange={(e) => setDeleteModal({ ...deleteModal, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white mb-6 focus:outline-none focus:border-red-500 transition-colors"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, password: "" })}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={!deleteModal.password}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;