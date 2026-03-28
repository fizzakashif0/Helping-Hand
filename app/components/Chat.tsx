import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import {
    ArrowLeft,
    MoreVertical,
    Paperclip,
    Send,
    Shield
} from "lucide-react-native";
import BottomNav, { NavItem } from "./Navbar";

interface ChatScreenProps {
  onBack: () => void;
  onComplete: () => void;
  userRole: "donor" | "recipient";
}

const mockMessages = [
  {
    id: "1",
    sender: "other",
    message: "Hello! Thank you for your interest in helping.",
    time: "10:30 AM"
  },
  {
    id: "2",
    sender: "me",
    message: "Hi! I'd like to help with your request.",
    time: "10:32 AM"
  },
  {
    id: "3",
    sender: "other",
    message: "That's wonderful! When would be a good time to coordinate?",
    time: "10:35 AM"
  },
  {
    id: "4",
    sender: "me",
    message: "I can drop off the items tomorrow afternoon.",
    time: "10:38 AM"
  }
];

export function ChatScreen({
  onBack,
  onComplete,
  userRole
}: ChatScreenProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [navTab, setNavTab] = useState<NavItem>("notifications");

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "me",
        message: message.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }
    ]);
    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View>
              <Text style={styles.userName}>
                {userRole === "donor" ? "Recipient" : "Donor"}
              </Text>
              <Text style={styles.status}>Active now</Text>
            </View>
          </View>

          <TouchableOpacity>
            <MoreVertical size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Privacy notice */}
        <View style={styles.privacyBox}>
          <Shield size={14} color="#fff" />
          <Text style={styles.privacyText}>
            Your privacy is protected. Personal details are kept confidential.
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messages}
        contentContainerStyle={{ paddingVertical: 12 }}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === "me"
                ? styles.alignRight
                : styles.alignLeft
            ]}
          >
            <View
              style={[
                styles.bubble,
                msg.sender === "me"
                  ? styles.myBubble
                  : styles.otherBubble
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === "me" && { color: "#fff" }
                ]}
              >
                {msg.message}
              </Text>
              <Text
                style={[
                  styles.time,
                  msg.sender === "me"
                    ? styles.myTime
                    : styles.otherTime
                ]}
              >
                {msg.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.completeWrapper}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onComplete}
        >
          <Text style={styles.completeText}>
            Mark Donation as Complete
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={styles.inputBar}>
        <TouchableOpacity>
          <Paperclip size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <BottomNav activeTab={navTab} onTabChange={setNavTab} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },

  header: {
    backgroundColor: "#1A5F7A",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginLeft: 12
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },

  avatarText: {
    fontSize: 18
  },

  userName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600"
  },

  status: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12
  },

  privacyBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 10,
    marginTop: 12
  },

  privacyText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    flex: 1
  },

  messages: {
    flex: 1,
    paddingHorizontal: 16
  },

  messageRow: {
    marginBottom: 10
  },

  alignRight: {
    alignItems: "flex-end"
  },

  alignLeft: {
    alignItems: "flex-start"
  },

  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18
  },

  myBubble: {
    backgroundColor: "#1A5F7A"
  },

  otherBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  messageText: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 4
  },

  time: {
    fontSize: 11,
    textAlign: "right"
  },

  myTime: {
    color: "rgba(255,255,255,0.7)"
  },

  otherTime: {
    color: "#6B7280"
  },

  completeWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },

  completeButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center"
  },

  completeText: {
    color: "#fff",
    fontWeight: "600"
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff"
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14
  },

  sendButton: {
    backgroundColor: "#1A5F7A",
    padding: 10,
    borderRadius: 20
  }
});
