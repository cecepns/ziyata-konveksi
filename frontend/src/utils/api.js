import axios from "axios";

// let rawBaseUrl = import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/ziyata-konveksi/api";
let rawBaseUrl = import.meta.env.VITE_API_URL || "https://api.ziyyatamode.id/api";
if (!rawBaseUrl.endsWith('/')) {
  rawBaseUrl += '/';
}

export const api = axios.create({
  baseURL: rawBaseUrl,
});

// Interceptor untuk menyisipkan Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor untuk menangani error auth (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
