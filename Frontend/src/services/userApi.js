import api from "./axios";

export const getCurrentUser = () =>
  api.get("/users/profile");

export const searchUsers = (keyword) =>
  api.get(`/users/search?userId=${keyword}`);