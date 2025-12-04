// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://dairy-attendance.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
