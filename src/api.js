import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api" || "http://localhost:5000/api",
  withCredentials: true, // Ensure cookies (like JWT) are sent
});

export default api;
