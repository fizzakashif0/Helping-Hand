import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as socketService from "../services/socketService";
import * as chatApi from "../services/chatApi";
import { getToken } from "../lib/token";
import { jwtDecode } from "jwt-decode";
import FeedbackForm from "../components/FeedbackForm";

import ChatBubble from "../components/ChatBubble";
import TypingIndicator from "../components/TypingIndicator";


interface Message {
  _id: string;
  senderId: { _id: string; name: string; profilePicture?: string };
  text: string;
  createdAt: string;
  readAt?: string;
}

interface Thread {
  _id: string;
  status: "active" | "locked";
  donorId: { _id: string; name: string };
  recipientId: { _id: string; name: string };
}

export default function ChatScreen() {
  const router = useRouter();
  const { threadId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [thread, setThread] = useState<Thread | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const [isTyping, setIsTyping] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    donationId: string;
    revieweeId: string;
    role: "donor" | "recipient";
  } | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.warn("ChatScreen: missing auth token");
          return;
        }
        const decoded: any = jwtDecode(token);
        const uid = decoded?.sub || decoded?.id;
        if (!uid) {
          console.warn("ChatScreen: unable to decode userId from JWT");
          return;
        }
        setUserId(uid);

        await fetchThread(uid);
        connectSocket();
      } catch (e) {
        console.error("ChatScreen init error:", e);
      }
    };

    init();

    return () => {
      socketService.offNewMessage();
      socketService.offTyping();
      socketService.offStopTyping();
      socketService.offRequestFeedback();
      socketService.disconnectSocket();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchThread = async (uid: string) => {
    try {
      setLoading(true);
      const data = await chatApi.getThreadById(threadId as string, uid);

      setThread(data);

      // Determine other user (not stored locally)
      const otherUser = data.donorId._id === uid ? data.recipientId : data.donorId;

      // Fetch messages
      const messagesData = await chatApi.getMessages(threadId as string, uid);

      setMessages(messagesData);


      // Mark as read
      socketService.markRead(threadId as string);
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRequestFeedback = (data: any) => {
    setFeedbackData({
      donationId: data.donationId,
      revieweeId: data.revieweeId,
      role: data.role,
    });
    setShowFeedback(true);
  };

  const connectSocket = () => {
    socketService.connectSocket();

    // Join thread and get history
    socketService.joinThread(threadId as string);


    // Listen for new messages
    socketService.onNewMessage((message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    // Listen for typing
    socketService.onTyping((data) => {
      if (data.senderId !== userId) {
        setIsTyping(true);
      }
    });

    socketService.onStopTyping((data) => {
      if (data.senderId !== userId) {
        setIsTyping(false);
      }
    });

    socketService.onRequestFeedback(onRequestFeedback);
  };

  const onSubmitSuccess = () => {
    // no-op (FeedbackForm manages UI)
  };

  const handleSendMessage = () => { 
    if (!inputText.trim()) return;

    socketService.sendMessage(threadId as string, inputText.trim());
    setInputText("");
    socketService.emitStopTyping(threadId as string);
  };

  const handleTyping = () => {
    socketService.emitTyping(threadId as string);

    // Debounce stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping(threadId as string);
    }, 1000);
  };

  const getOtherUserName = () => {
    if (!thread) return "Chat";
    return thread.donorId._id === userId
      ? thread.recipientId.name
      : thread.donorId.name;
  };

  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId._id === userId;
    
    // Check if date changed
    let showDateSeparator = false;
    if (index === 0) {
      showDateSeparator = true;
    } else {
      const currentDate = new Date(item.createdAt).toDateString();
      const prevDate = new Date(messages[index - 1].createdAt).toDateString();
      showDateSeparator = currentDate !== prevDate;
    }

    return (
      <>
        {showDateSeparator && (

          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
        <ChatBubble
          message={item}
          isOwn={isOwn}
          showReadReceipt={isOwn}
        />
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1A5F7A" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{getOtherUserName()}</Text>
          {thread?.status === "locked" && (
            <View style={styles.lockedBadge}>
              <MaterialIcons name="lock" size={12} color="#fff" />
              <Text style={styles.lockedText}>Closed</Text>
            </View>
          )}
        </View>
        <MaterialIcons name="more-vert" size={24} color="#fff" />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <TypingIndicator />
          <Text style={styles.typingText}>is typing...</Text>
        </View>
      )}

      {/* Input Bar or Closed Banner */}
      {thread?.status === "active" ? (

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (text.length > 0) {
                handleTyping();
              }
            }}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={inputText.trim() ? "#007AFF" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.closedBanner}>
          <MaterialIcons name="lock" size={18} color="#666" />
          <Text style={styles.closedBannerText}>
            This donation is complete. Chat is now closed.
          </Text>
        </View>
      )}
        <FeedbackForm
          visible={showFeedback}
          donationId={feedbackData?.donationId ?? ""}
          revieweeId={feedbackData?.revieweeId ?? ""}
          userId={userId}
          role={feedbackData?.role ?? "donor"}
          onDismiss={() => {
            setShowFeedback(false);
            setFeedbackData(null);
          }}
          onSubmitSuccess={onSubmitSuccess}

        />
      </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#1A5F7A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0E4A61",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  lockedText: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.8,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 12,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  typingText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  closedBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
});
