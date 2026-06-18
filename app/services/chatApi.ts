import api, { api as apiClient } from "./api";
import { getToken } from "../lib/token";


// Axios interceptor to add JWT token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Project uses AsyncStorage auth token
      const token = await getToken();
      if (token) {
        config.headers = config.headers || {};
        // Prefer Authorization: Bearer <token>
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Do not hard-fail requests if auth token cannot be read
      console.warn("chatApi interceptor: failed to read token", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);


/**
 * Get all chat threads for the authenticated user
 * GET /api/chats
 */
export const getMyThreads = async (userId: string) => {
  try {
    const response = await apiClient.get("/api/chats", {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching threads:", error);
    throw error;
  }
};

/**
 * Get a specific chat thread by ID
 * GET /api/chats/:id
 */
export const getThreadById = async (threadId: string, userId: string) => {
  try {
    const response = await apiClient.get(`/api/chats/${threadId}`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching thread:", error);
    throw error;
  }
};

/**
 * Create a new chat thread
 * POST /api/chats
 */
export const createThread = async (body: {
  donorId: string;
  recipientId: string;
  donationId: string;
}) => {
  try {
    const response = await apiClient.post("/api/chats", body);
    return response.data;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
};

/**
 * Get all messages in a thread
 * GET /api/messages/:threadId/messages
 */
export const getMessages = async (threadId: string, userId: string) => {
  try {
    const response = await apiClient.get(`/api/messages/${threadId}/messages`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export default apiClient;

