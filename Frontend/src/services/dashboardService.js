import api from "./api";

export const dashboardService = {
  async getStatistics() {
    const response = await api.get("/api/dashboard/statistics");
    return response.data;
  }
};
