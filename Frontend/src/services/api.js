import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sample-tracking-backend.vercel.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: inject Bearer access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: handle 401 token expiration with automatic refresh token renewal
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop on auth endpoints (login, refresh, logout)
      if (
        originalRequest.url.includes("/api/auth/login") ||
        originalRequest.url.includes("/api/auth/refresh") ||
        originalRequest.url.includes("/api/auth/logout")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newAccessToken = res.data.access_token;
          const newRefreshToken = res.data.refresh_token;

          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;

          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login?session_expired=true";
          }
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
