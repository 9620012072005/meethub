import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ,
  withCredentials: true, // Ensure cookies (like JWT) are sent
});

export default api;
