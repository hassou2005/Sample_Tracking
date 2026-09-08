import api from "./api";

export const sampleService = {
  // ============================================================
  // CREATE SAMPLE
  // ============================================================

  async createSample(sampleData) {
    /*
     * New Sample Registration payload:
     *
     * {
     *   name,
     *   sample_code,
     *   prof,
     *   project,
     *   trial,
     *   site,
     *   crop,
     *   plot,
     *   part,
     *   collector,
     *   reception_date,
     *   dest
     * }
     */

    const payload = {
      name: sampleData.name?.trim() || "",
      sample_code: sampleData.sample_code?.trim() || "",

      prof: sampleData.prof?.trim() || "",
      project: sampleData.project?.trim() || "",
      trial: sampleData.trial?.trim() || "",
      site: sampleData.site?.trim() || "",
      crop: sampleData.crop?.trim() || "",
      plot: sampleData.plot?.trim() || "",
      part: sampleData.part?.trim() || "",
      collector: sampleData.collector?.trim() || "",

      reception_date: sampleData.reception_date || null,

      dest: sampleData.dest?.trim() || "",
    };

    const response = await api.post("/api/samples", payload);

    return response.data;
  },

  // ============================================================
  // GET SAMPLES
  // ============================================================

  async getSamples(params = {}) {
    const response = await api.get("/api/samples", {
      params,
    });

    return response.data;
  },

  // ============================================================
  // GET SAMPLE BY ID
  // ============================================================

  async getSampleById(id) {
    const response = await api.get(`/api/samples/${id}`);

    return response.data;
  },

  // ============================================================
  // GET SAMPLE BY BARCODE
  // ============================================================

  async getSampleByBarcode(barcode) {
    const response = await api.get(
      `/api/samples/barcode/${encodeURIComponent(barcode)}`
    );

    return response.data;
  },

  // ============================================================
  // GET SAMPLE HISTORY
  // ============================================================

  async getSampleHistory(id) {
    const response = await api.get(`/api/samples/${id}/history`);

    return response.data;
  },

  // ============================================================
  // UPDATE SAMPLE
  // ============================================================

  async updateSample(id, sampleData) {
    const response = await api.put(
      `/api/samples/${id}`,
      sampleData
    );

    return response.data;
  },

  // ============================================================
  // DELETE SAMPLE
  // ============================================================

  async deleteSample(id) {
    const response = await api.delete(`/api/samples/${id}`);

    return response.data;
  },

  // ============================================================
  // SAMPLE TYPES
  // ============================================================

  async getSampleTypes() {
    const response = await api.get("/api/sample-types");

    return response.data;
  },

  // ============================================================
  // WORKFLOW STAGES
  // ============================================================
  async getWorkflowStages() {
    const response = await api.get("/api/workflow-stages");
    return response.data;
  },

  // ============================================================
  // LOCATIONS
  // ============================================================
  async getLocations() {
    const response = await api.get("/api/locations");
    return response.data;
  },
};