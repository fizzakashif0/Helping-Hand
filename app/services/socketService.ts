import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { getToken } from "../lib/token";

// TODO: move to .env when configured
const API_URL = "http://localhost:5000";

let socket: any = null;

export const connectSocket = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Missing auth token for socket connection");
    }

    const decoded: any = jwtDecode(token);
    const userId = decoded?.sub || decoded?.id;
    if (!userId) {
      throw new Error("Unable to decode userId from JWT");
    }

    socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });


    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return socket;
  } catch (error) {
    console.error("Failed to connect socket:", error);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinThread = (threadId: string, onHistory?: (messages: any[]) => void) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.emit("join_thread", { threadId }, (response: any) => {
    if (response.error) {
      console.error("Error joining thread:", response.error);
    } else {
      console.log("Joined thread, received history:", response.messages?.length);
      if (onHistory && Array.isArray(response.messages)) {
        onHistory(response.messages);
      }
    }
  });
};

export const sendMessage = (threadId: string, text: string, attachments?: any[]) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.emit("send_message", { threadId, text, attachments }, (response: any) => {
    if (response.error) {
      console.error("Error sending message:", response.error);
    } else {
      console.log("Message sent successfully");
    }
  });
};
export const emitTyping = (threadId: string) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.emit("typing", { threadId });
};

export const emitStopTyping = (threadId: string) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.emit("stop_typing", { threadId });
};

export const markRead = (threadId: string) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.emit("mark_read", { threadId }, (response: any) => {
    if (response.error) {
      console.error("Error marking read:", response.error);
    } else {
      console.log("Messages marked as read");
    }
  });
};

export const onNewMessage = (callback: (data: any) => void) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.on("new_message", callback);
};

export const onTyping = (callback: (data: any) => void) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.on("user_typing", callback);
};

export const onStopTyping = (callback: (data: any) => void) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.on("user_stop_typing", callback);
};

export const onMessagesRead = (callback: (data: any) => void) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.on("messages_read", callback);
};

export const offNewMessage = () => {
  if (socket) {
    socket.off("new_message");
  }
};

export const offTyping = () => {
  if (socket) {
    socket.off("user_typing");
  }
};

export const offStopTyping = () => {
  if (socket) {
    socket.off("user_stop_typing");
  }
};

export const offMessagesRead = () => {
  if (socket) {
    socket.off("messages_read");
  }
};

export const onRequestFeedback = (callback: (data: any) => void) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  socket.on("request_feedback", callback);
};
export const markComplete = (threadId: string, callback: (response: any) => void) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }
  socket.emit("mark_complete", { threadId }, callback);
};

export const onChatLocked = (callback: (data: any) => void) => {
  if (!socket) return;
  socket.off("chat_locked");
  socket.on("chat_locked", callback);
};

export const onCompletionRequested = (callback: (data: any) => void) => {
  if (!socket) return;
  socket.off("completion_requested");
  socket.on("completion_requested", callback);
};

export const offChatLocked = () => {
  if (socket) socket.off("chat_locked");
};

export const offCompletionRequested = () => {
  if (socket) socket.off("completion_requested");
};
export const offRequestFeedback = () => {
  if (socket) {
    socket.off("request_feedback");
  }
};


