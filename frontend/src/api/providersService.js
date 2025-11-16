import axiosInstance from "./axiosConfig";

const providersService = {
  // Basic provider search
  searchProviders: async (params) => {
    try {
      const response = await axiosInstance.get("/providers/", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Advanced provider search with filters
  advancedSearch: async (params) => {
    try {
      const response = await axiosInstance.get("/providers/search", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get provider by ID
  getProviderById: async (providerId) => {
    try {
      const response = await axiosInstance.get(`/providers/${providerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get my provider profile (for providers only)
  getMyProfile: async () => {
    try {
      const response = await axiosInstance.get("/providers/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create provider profile
  createProfile: async (data) => {
    try {
      const response = await axiosInstance.post("/providers/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update provider profile
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put("/providers/me", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update availability
  updateAvailability: async (available) => {
    try {
      const response = await axiosInstance.put("/providers/availability", {
        available,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update pricing
  updatePricing: async (pricing) => {
    try {
      const response = await axiosInstance.put("/providers/pricing", {
        pricing,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default providersService;
