import api from "./api";

export const authService = {
  async login(email, password, rememberMe = false) {
    const response = await api.post("/api/auth/login", {
      email,
      password,
      remember_me: rememberMe
    });
    return response.data;
  },

  async register(userData) {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  async refreshToken(refreshTokenStr) {
    const response = await api.post("/api/auth/refresh", {
      refresh_token: refreshTokenStr
    });
    return response.data;
  },

  async logout(refreshTokenStr) {
    try {
      if (refreshTokenStr) {
        await api.post("/api/auth/logout", { refresh_token: refreshTokenStr });
      }
    } catch (e) {
      console.warn("Logout notification failed:", e);
    }
  },

  async getCurrentUser() {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get("/api/users");
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post("/api/users", userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  }
};
