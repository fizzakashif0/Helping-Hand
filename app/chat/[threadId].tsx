import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import FeedbackForm from "../components/FeedbackForm";
import { buildApiUrl } from "../lib/api";
import { getCurrentLocation, reverseGeocodeNominatim } from "../lib/locationService";
import { getToken } from "../lib/token";
import * as socketService from "../services/socketService";

import ChatBubble from "../components/ChatBubble";
import TypingIndicator from "../components/TypingIndicator";

export type Attachment = {
  type: "file" | "location";
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  areaName?: string;
  fullAddress?: string;
};

interface Message {
  _id: string;
  senderId: { _id: string; name: string; profilePicture?: string };
  text: string;
  attachments?: Attachment[];
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
  const [unreadCount, setUnreadCount] = useState(0);

  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    donationId: string;
    revieweeId: string;
    role: "donor" | "recipient";
  } | null>(null);

  // File attachment states
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

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
        const uid = decoded?.id || decoded?.sub;
        if (!uid) {
          console.warn("ChatScreen: unable to decode userId");
          return;
        }
        setUserId(uid);

        await socketService.connectSocket();
        await fetchThread(uid);
        setupSocketListeners();
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
      const token = await getToken();

      const response = await fetch(buildApiUrl(`/api/chats/${threadId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch chat:", response.status);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setThread({
        _id: data._id,
        status: data.status || "active",
        donorId: data.donorId || { _id: "", name: "Donor" },
        recipientId: data.recipientId || { _id: "", name: "Recipient" },
      });

      socketService.markRead(threadId as string);
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setShowAttachmentMenu(false);

      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert("Error", "Could not get your location. Please check permissions.");
        return;
      }

      const geocodeResult = await reverseGeocodeNominatim(
        location.latitude,
        location.longitude
      );

      if (!geocodeResult) {
        Alert.alert("Error", "Failed to get location details");
        return;
      }

      const locationAttachment: Attachment = {
        type: "location",
        latitude: location.latitude,
        longitude: location.longitude,
        landmark: geocodeResult.landmark,
        areaName: geocodeResult.areaName,
        fullAddress: geocodeResult.fullAddress,
      };

      setSelectedAttachment(locationAttachment);
    } catch (error) {
      console.error("Error sharing location:", error);
      Alert.alert("Error", "Failed to share location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSendWithAttachment = () => {
    if (!inputText.trim() && !selectedAttachment) return;

    const attachments = selectedAttachment ? [selectedAttachment] : undefined;

    socketService.sendMessage(threadId as string, inputText.trim(), attachments);
    setInputText("");
    setSelectedAttachment(null);
    socketService.emitStopTyping(threadId as string);
  };

  const setupSocketListeners = () => {
    socketService.joinThread(threadId as string, (messages: any[]) => {
      setMessages(messages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socketService.onNewMessage((message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socketService.onTyping((data) => {
      if (data.senderId !== userId) setIsTyping(true);
    });

    socketService.onStopTyping((data) => {
      if (data.senderId !== userId) setIsTyping(false);
    });

    socketService.onRequestFeedback((data) => {
      setFeedbackData({
        donationId: data.donationId,
        revieweeId: data.revieweeId,
        role: data.role,
      });
      setShowFeedback(true);
    });
  };

  const onSubmitSuccess = () => {
    // no-op (FeedbackForm manages UI)
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
    if (!thread.donorId || !thread.recipientId) return "Chat";
    return thread.donorId._id === userId
      ? (thread.recipientId?.name || "Recipient")
      : (thread.donorId?.name || "Donor");
  };

  const calculateUnreadCount = () => {
    return messages.filter((msg) => msg.senderId._id !== userId && !msg.readAt).length;
  };

  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId._id === userId;

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

  const unreads = calculateUnreadCount();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Avatar with Initials */}
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {getOtherUserName().charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{getOtherUserName()}</Text>
          <Text style={styles.headerStatus}>
            {thread?.status === "locked" ? "🔒 Closed" : "Active"}
          </Text>
        </View>

        {unreads > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unreads > 99 ? "99+" : unreads}
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={() => Alert.alert("Options", "More features coming soon")}>
          <MaterialIcons name="more-vert" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages.length > 0 ? (
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
      ) : (
        <View style={styles.emptyMessagesContainer} />
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingWrapper}>
          <View style={styles.typingBubble}>
            <TypingIndicator />
          </View>
        </View>
      )}

      {/* Selected Attachment Preview */}
      {selectedAttachment && (
        <View style={styles.attachmentPreview}>
          <View style={styles.attachmentContent}>
            {selectedAttachment.type === "location" ? (
              <>
                <MaterialIcons name="location-on" size={24} color="#FF6B35" />
                <View style={styles.attachmentText}>
                  <Text style={styles.attachmentTitle} numberOfLines={1}>
                    {selectedAttachment.landmark}
                  </Text>
                  <Text style={styles.attachmentSubtitle} numberOfLines={1}>
                    {selectedAttachment.areaName}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <MaterialIcons name="attach-file" size={24} color="#007AFF" />
                <View style={styles.attachmentText}>
                  <Text style={styles.attachmentTitle} numberOfLines={1}>
                    {selectedAttachment.filename}
                  </Text>
                  <Text style={styles.attachmentSubtitle}>
                    {selectedAttachment.fileSize
                      ? `${(selectedAttachment.fileSize / 1024).toFixed(2)} KB`
                      : ""}
                  </Text>
                </View>
              </>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setSelectedAttachment(null)}
            style={styles.removeAttachment}
          >
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar or Closed Banner */}
      {thread?.status === "active" ? (
        <View style={styles.inputContainer}>
          {/* Attachment Menu */}
          <Modal
            visible={showAttachmentMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAttachmentMenu(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowAttachmentMenu(false)}
            >
              <View style={styles.attachmentMenu}>
                <TouchableOpacity
                  style={styles.attachmentOption}
                  onPress={handleShareLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color="#1A5F7A" />
                  ) : (
                    <MaterialIcons name="location-on" size={24} color="#FF6B35" />
                  )}
                  <Text style={styles.attachmentOptionText}>Share Location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attachmentOption}
                  onPress={() => {
                    Alert.alert("Files", "File upload feature coming soon");
                    setShowAttachmentMenu(false);
                  }}
                >
                  <MaterialIcons name="attach-file" size={24} color="#007AFF" />
                  <Text style={styles.attachmentOptionText}>Upload File</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Input Bar */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachmentMenu(true)}
          >
            <MaterialIcons name="add-circle-outline" size={28} color="#1A5F7A" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Message..."
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
            style={[
              styles.sendButton,
              (inputText.trim() || selectedAttachment) && styles.sendButtonActive,
            ]}
            onPress={handleSendWithAttachment}
            disabled={!inputText.trim() && !selectedAttachment}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={inputText.trim() || selectedAttachment ? "#fff" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.closedBanner}>
          <MaterialIcons name="lock" size={20} color="#795548" />
          <Text style={styles.closedBannerText}>
            This donation is complete. Chat is now closed.
          </Text>
        </View>
      )}

      {/* Feedback Form Modal */}
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
    paddingHorizontal: 8,
    paddingVertical: 10,
    paddingTop: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backBtn: {
    padding: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerStatus: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 1,
  },
  unreadBadge: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyMessagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: "#888",
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  typingWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  typingBubble: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
  },
  attachmentContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  attachmentText: {
    flex: 1,
  },
  attachmentTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  attachmentSubtitle: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  removeAttachment: {
    padding: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 6,
    backgroundColor: "#f0f0f0",
  },
  attachButton: {
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#1A5F7A",
  },
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#FFE082",
  },
  closedBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#795548",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  attachmentMenu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  attachmentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    gap: 12,
  },
  attachmentOptionText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
});
