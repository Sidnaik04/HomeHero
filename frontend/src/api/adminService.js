import axiosInstance from "./axiosConfig";

const adminService = {
  getAllUsers: async (skip = 0, limit = 50) => {
    try {
      const response = await axiosInstance.get("/admin/users", {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllProviders: async (skip = 0, limit = 50) => {
    try {
      const response = await axiosInstance.get("/admin/providers", {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approveProvider: async (providerId) => {
    try {
      const response = await axiosInstance.post(
        `/admin/providers/${providerId}/approve`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllBookings: async () => {
    try {
      const response = await axiosInstance.get("/admin/bookings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default adminService;
