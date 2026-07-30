import api from "./axios";

export const getChats = () =>
  api.get("/chats");

export const createChat = (receiverId) =>
  api.post("/chats", {
    receiverId,
  });

export const getMessages = (chatId, page = 1) =>
  api.get(`/messages/${chatId}?page=${page}`);

export const sendMessage = (formData) =>
  api.post("/messages", formData);

export const markAsRead = (messageId) =>
  api.patch("/messages/read", {
    messageId,
  });

export const deleteForMe = (messageId) =>
  api.patch("/messages/delete-me", {
    messageId,
  });

export const deleteForEveryone = (messageId) =>
  api.patch("/messages/delete-everyone", {
    messageId,
  });