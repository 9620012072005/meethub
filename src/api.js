import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Uses the environment variable
  withCredentials: true, // Ensures authentication tokens are sent
});

export default api;
