import axios from "axios";

const API_BASE_URL = "https://meethub-backend.onrender.com/api"; // ✅ Backend URL (Ensure /api is included)

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ Allows cookies & authentication headers
});

export default api;
