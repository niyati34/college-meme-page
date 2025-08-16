import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL || "" // allow override via env, else relative same domain
      : process.env.REACT_APP_API_URL || "http://localhost:5000", // Development
});

export const fetchMemes = (queryParams = "") => {
  const url = queryParams ? `/api/memes?${queryParams}` : "/api/memes";
  return API.get(url);
};

export const fetchMeme = (id) => API.get(`/api/memes/${id}`);

export const deleteMeme = (id, token) =>
  API.delete(`/api/memes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const likeMeme = (id, token) =>
  API.post(
    `/api/memes/like/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const viewMeme = (id) => API.post(`/api/memes/view/${id}`);

export const getComments = (memeId, token = null) => {
  const config = token
    ? {
        headers: { Authorization: `Bearer ${token}` },
      }
    : {};
  return API.get(`/api/comments/${memeId}`, config);
};

export const postComment = (commentId, text, token) =>
  API.post(
    `/api/comments/${commentId}`,
    { text },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const deleteComment = (commentId, token) =>
  API.delete(`/api/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const register = (email, password, username) =>
  API.post("/api/auth/register", { email, password, username });

export const login = (email, password) =>
  API.post("/api/auth/login", { email, password });

export const uploadMeme = (formData, token) =>
  API.post("/api/memes/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });