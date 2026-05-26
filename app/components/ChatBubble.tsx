import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface Message {
  _id: string;
  senderId: { _id: string; name: string };
  text: string;
  createdAt: string;
  readAt?: string;
}

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showReadReceipt: boolean;
}

export default function ChatBubble({
  message,
  isOwn,
  showReadReceipt,
}: ChatBubbleProps) {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View
      style={[
        styles.bubbleContainer,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
          {message.text}
        </Text>
        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timestamp,
              isOwn ? styles.ownTimestamp : styles.otherTimestamp,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
          {isOwn && showReadReceipt && (
            <MaterialIcons
              name={message.readAt ? "done-all" : "done"}
              size={14}
              color={message.readAt ? "#007AFF" : "#999"}
              style={styles.tickIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    paddingVertical: 4,
  },
  ownContainer: {
    alignItems: "flex-end",
    paddingRight: 8,
  },
  otherContainer: {
    alignItems: "flex-start",
    paddingLeft: 8,
  },
  bubble: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "85%",
  },
  ownBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: "#e5e5ea",
    borderBottomLeftRadius: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownText: {
    color: "#fff",
  },
  otherText: {
    color: "#000",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  ownTimestamp: {
    color: "#ffffff88",
  },
  otherTimestamp: {
    color: "#99999988",
  },
  tickIcon: {
    marginLeft: 2,
  },
});
