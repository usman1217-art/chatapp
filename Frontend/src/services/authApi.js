import api from "./axios";

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const googleLogin = (data) =>
  api.post("/auth/google", data);

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email/${token}`);

export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const logoutUser = () =>
  api.post("/auth/logout");

export const refreshToken = () =>
  api.post("/auth/refresh", {}, { withCredentials: true });