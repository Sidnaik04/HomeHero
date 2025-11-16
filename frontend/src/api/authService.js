import axiosInstance from "./axiosConfig";

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const payload = {
        email_or_phone: credentials.email_or_phone || credentials.email,
        password: credentials.password,
      };

      const response = await axiosInstance.post("/auth/login", payload);

      // Store token and user data in localStorage
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  // Get user profile from API
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/users/me");
      // Update localStorage with fresh user data
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
