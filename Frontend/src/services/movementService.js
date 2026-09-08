import api from "./api";

export const movementService = {
  async scanBarcode(barcode) {
    const response = await api.post("/api/scanner/scan", { barcode });
    return response.data;
  },

  async manualMove(movementData) {
    const response = await api.post("/api/movements/manual", movementData);
    return response.data;
  },

  async adminCorrection(correctionData) {
    const response = await api.post("/api/movements/admin-correction", correctionData);
    return response.data;
  },

  async getMovements(params = {}) {
    const response = await api.get("/api/movements", { params });
    return response.data;
  },

  async getSampleMovements(sampleId) {
    const response = await api.get(`/api/movements/sample/${sampleId}`);
    return response.data;
  }
};
