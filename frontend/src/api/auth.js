import axios from "axios";

// Create API instance
const API = axios.create({
  baseURL: "http://127.0.0.1:8000", 
});

// Add token to headers if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth-specific API methods
const auth = {
  login: async (email, password) => {
    return await API.post("/dj-rest-auth/login/", { email, password });
  },
  register: async (username, email, password1, password2) => {
    return await API.post("/dj-rest-auth/registration/", {
      username,
      email,
      password1,
      password2,
    });
  },
  logout: async () => {
    return await API.post("/dj-rest-auth/logout/");
  },
  getUser: async () => {
    return await API.get("/dj-rest-auth/user/");
  },
  resetPassword: async (email) => {
    return await API.post("/dj-rest-auth/password/reset/", { email });
  }
};

export default auth;