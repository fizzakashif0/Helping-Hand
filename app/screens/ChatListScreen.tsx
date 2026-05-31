import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as chatApi from "../services/chatApi";

interface Thread {
  _id: string;
  donorId: { _id: string; name: string; profilePicture?: string };
  recipientId: { _id: string; name: string; profilePicture?: string };
  status: "active" | "locked";
  updatedAt: string;
}

interface PendingRequest {
  _id: string;
  donorId: { _id: string; name: string; avatar?: string };
  recipientId: { _id: string; name: string; avatar?: string };
  status: "pending" | "accepted" | "declined";
}

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userId, setUserId] = useState<string>("");

  // In production, get userId from AsyncStorage/JWT
  // For now, hardcode or get from navigation params
  useEffect(() => {
    // TODO: Get userId from secure storage when JWT is implemented
    const id = "user123"; // Placeholder
    setUserId(id);
    fetchThreads(id);
    fetchPendingRequests(id);
  }, []);

  const fetchThreads = async (uid: string) => {
    try {
      setLoading(true);
      const data = await chatApi.getMyThreads(uid);
      setThreads(data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchThreads(userId);
    await fetchPendingRequests(userId);
    setRefreshing(false);
  };

  const fetchPendingRequests = async (uid: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat-requests/pending?userId=${encodeURIComponent(uid)}`
      );
      if (!response.ok) return;
      const data = await response.json();
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat-requests/${requestId}/accept?userId=${encodeURIComponent(userId)}`,
        { method: "PATCH" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to accept request");
      }
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (data?.threadId) {
        router.push(`/chat/${data.threadId}` as any);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat-requests/${requestId}/decline?userId=${encodeURIComponent(userId)}`,
        { method: "PATCH" }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to decline request");
      }
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  const getOtherUser = (thread: Thread) => {
    // Assuming userId is the current user
    // Return the other person's info
    if (thread.donorId._id === userId) {
      return thread.recipientId;
    }
    return thread.donorId;
  };

  const filteredThreads = threads.filter((thread) => {
    const otherUser = getOtherUser(thread);
    return otherUser.name.toLowerCase().includes(searchText.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderChatRow = ({ item: thread }: { item: Thread }) => {
    const otherUser = getOtherUser(thread);
    const initials = getInitials(otherUser.name);

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() =>
          navigation.navigate("ChatScreen", { threadId: thread._id })
        }
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Chat info */}
        <View style={styles.chatInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{otherUser.name}</Text>
            {thread.status === "locked" && (
              <MaterialIcons name="lock" size={14} color="#999" />
            )}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            Last message preview...
          </Text>
        </View>

        {/* Timestamp */}
        <View style={styles.rightContainer}>
          <Text style={styles.timestamp}>
            {formatTimestamp(thread.updatedAt)}
          </Text>
          {/* Unread badge (placeholder) */}
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>2</Text>
          </View>
        </View>
      </TouchableOpacity>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search or start a new chat"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.requestsSection}>
        <Text style={styles.requestsTitle}>Incoming Requests</Text>
        {pendingRequests.map((request) => {
          const otherPerson =
            request.donorId._id === userId ? request.recipientId : request.donorId;

          return (
            <View key={request._id} style={styles.requestCard}>
              <Text style={styles.requestName}>{otherPerson?.name || "Unknown User"}</Text>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.requestActionBtn, styles.acceptBtn]}
                  onPress={() => handleAccept(request._id)}
                >
                  <Text style={styles.requestActionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.requestActionBtn, styles.declineBtn]}
                  onPress={() => handleDecline(request._id)}
                >
                  <Text style={styles.requestActionText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Chat List */}
      {filteredThreads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No chats yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          renderItem={renderChatRow}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  chatRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  lastMessage: {
    fontSize: 13,
    color: "#999",
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#31a24c",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  requestsSection: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  requestsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A5F7A",
    marginBottom: 8,
  },
  requestCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  requestName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  requestActionBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  acceptBtn: {
    backgroundColor: "#16A34A",
  },
  declineBtn: {
    backgroundColor: "#DC2626",
  },
  requestActionText: {
    color: "#fff",
    fontWeight: "600",
  },
});
