import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://meethub-backend.onrender.com/api",
  withCredentials: true, // Ensures authentication tokens (JWT) are sent
});

export default api;
