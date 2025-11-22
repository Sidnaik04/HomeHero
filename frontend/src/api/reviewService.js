import axiosInstance from "./axiosConfig";

const reviewsService = {
  // Submit a review
  submitReview: async (reviewData) => {
    try {
      const response = await axiosInstance.post("/reviews/", reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get provider reviews
  getProviderReviews: async (providerId) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/provider/${providerId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get review by ID
  getReviewById: async (reviewId) => {
    try {
      const response = await axiosInstance.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get my reviews (as customer)
  getMyReviews: async () => {
    try {
      const response = await axiosInstance.get("/reviews/my-reviews");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload one or more images for a review. Expects multipart/form-data
  uploadImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const response = await axiosInstance.post("/reviews/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default reviewsService;
