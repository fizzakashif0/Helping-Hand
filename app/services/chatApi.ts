import axios from "axios";
import * as SecureStore from "expo-secure-store";

// TODO: move to .env when configured
const API_BASE_URL = "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Axios interceptor to add JWT token (when auth is complete)
// TODO: add Bearer token when JWT is complete
apiClient.interceptors.request.use(
  async (config) => {
    // Placeholder: will add JWT token here when auth is implemented
    // const token = await SecureStore.getItemAsync("jwtToken");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
