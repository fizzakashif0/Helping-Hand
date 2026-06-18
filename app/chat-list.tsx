import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav, { NavItem } from "./components/Navbar";
import { buildApiUrl } from "./lib/api";
import { getToken } from "./lib/token";

interface ChatListItem {
  _id: string;
  otherUser: { _id: string; name: string; profilePicture?: string };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "active" | "locked";
  updatedAt: string;
}

export default function ChatListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("notifications");
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const decoded: any = jwtDecode(token);
        const uid = decoded?.id || decoded?.sub;
        if (!uid) {
          setLoading(false);
          return;
        }

        setUserId(uid);
        await fetchChats(uid, token);
      } catch (error) {
        console.error("Init error:", error);
        setLoading(false);
      }
    };

    init();
  }, []);

const fetchChats = async (uid: string, token: string) => {
  try {
    setLoading(true);
    const response = await fetch(buildApiUrl(`/api/chats`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setChats([]);
      return;
    }

    const data = await response.json();

    const mapped = Array.isArray(data) ? data.map((thread: any) => {
      const isUserDonor = thread.donorId?._id === uid || thread.donorId === uid;
      const otherUser = isUserDonor ? thread.recipientId : thread.donorId;

      return {
        _id: thread._id,
        otherUser: {
          _id: otherUser?._id || otherUser || "",
          name: otherUser?.name || "User",
          profilePicture: otherUser?.profilePicture,
        },
        lastMessage: thread.lastMessage || "No messages yet",
        lastMessageTime: thread.updatedAt || thread.createdAt,
        unreadCount: thread.unreadCount || 0,
        status: thread.status || "active",
        updatedAt: thread.updatedAt,
      };
    }) : [];

    setChats(mapped);
  } catch (error) {
    console.error("Error fetching chats:", error);
    setChats([]);
  } finally {
    setLoading(false);
  }
};

  const onRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const token = await getToken();
      if (token) {
        await fetchChats(userId, token);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    return chat.otherUser.name.toLowerCase().includes(searchText.toLowerCase());
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

  const renderChatRow = ({ item: chat }: { item: ChatListItem }) => {
    const initials = getInitials(chat.otherUser.name);

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() => router.push(`/chat/${chat._id}`)}
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
            <Text style={styles.name}>{chat.otherUser.name}</Text>
            {chat.status === "locked" && (
              <MaterialIcons name="lock" size={14} color="#999" />
            )}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.lastMessage || "No messages yet"}
          </Text>
        </View>

        {/* Timestamp */}
        <View style={styles.rightContainer}>
          <Text style={styles.timestamp}>
            {formatTimestamp(chat.lastMessageTime)}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1A5F7A" />
        </View>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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
          placeholder="Search chats..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Chat List */}
      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No chats yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatRow}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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
    paddingVertical: 12,
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
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
