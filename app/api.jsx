import axios from "axios"

const BASE_URL = "http://127.0.0.1:5000"; // your Flask backend

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

const API = {
  dashboard: async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  analyzeFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    return res.json();
  },

  updateProfile: async (data) => {
    const res = await fetch(`${BASE_URL}/profile/update`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch(`${BASE_URL}/profile/upload-photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    return res.json();
  },
};

export default API;
