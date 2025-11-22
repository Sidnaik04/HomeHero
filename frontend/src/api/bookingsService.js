import axiosInstance from "./axiosConfig";

const bookingsService = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await axiosInstance.post("/bookings/", bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get my bookings (customer or provider)
  getMyBookings: async () => {
    try {
      const response = await axiosInstance.get("/bookings/my-bookings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get booking status
  getBookingStatus: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel booking (customer)
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await axiosInstance.delete(`/bookings/${bookingId}`, {
        data: { reason },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reschedule booking
  rescheduleBooking: async (bookingId, newDateTime, reason) => {
    try {
      const response = await axiosInstance.put(
        `/bookings/${bookingId}/reschedule`,
        {
          new_date_time: newDateTime,
          reason,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if booking can be cancelled
  canCancelBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.get(
        `/bookings/${bookingId}/can-cancel`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request callback
  requestCallback: async (providerId, preferredTime, message) => {
    try {
      const response = await axiosInstance.post("/bookings/requests/callback", {
        provider_id: providerId,
        preferred_time: preferredTime,
        message,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Provider: Get pending bookings
  getPendingBookings: async () => {
    try {
      const response = await axiosInstance.get("/bookings/provider/pending");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Provider: Respond to booking (accept/decline)
  respondToBooking: async (bookingId, status) => {
    try {
      const response = await axiosInstance.post(
        `/bookings/${bookingId}/respond`,
        {
          status,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Complete: Booking completed
  completeBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.post(
        `/bookings/${bookingId}/complete`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default bookingsService;
