import axiosInstance from "./axiosConfig";

const usersService = {
  // Get my profile
  getMyProfile: async () => {
    try {
      const response = await axiosInstance.get("/users/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update my profile
  updateMyProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put("/users/me", profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update location
  updateLocation: async (location, pincode) => {
    try {
      const response = await axiosInstance.post("/users/location", {
        location,
        pincode,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosInstance.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default usersService;
