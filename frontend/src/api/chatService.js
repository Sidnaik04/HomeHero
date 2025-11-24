import axiosInstance from './axiosConfig';

const chatService = {
  // Send chat message
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await axiosInstance.post('/chat/query', {
        message,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get chat history
  getChatHistory: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all sessions
  getSessions: async () => {
    try {
      const response = await axiosInstance.get('/chat/sessions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default chatService;