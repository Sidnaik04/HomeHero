import axiosInstance from './axiosConfig';

const servicesService = {
  // Get all available services
  getAllServices: async () => {
    try {
      const response = await axiosInstance.get('/services/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get service categories
  getServiceCategories: async () => {
    try {
      const response = await axiosInstance.get('/services/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // AI service suggestion
  suggestService: async (query) => {
    try {
      const response = await axiosInstance.get(`/services/suggest/${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default servicesService;