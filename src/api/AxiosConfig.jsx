import axios from "axios";

const API = axios.create({
  //http://localhost:8080/api

  baseURL: "/api",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response && error.response.status === 400) ||
      error.response.status === 401
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
