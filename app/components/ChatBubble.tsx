import { MaterialIcons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  senderId: { _id: string; name: string };
  text: string;
  attachments?: Attachment[];
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

  const handleLocationPress = (attachment: Attachment) => {
    if (attachment.latitude && attachment.longitude) {
      Alert.alert(
        "Location",
        attachment.fullAddress || "Location shared",
        [
          { text: "Got it", style: "cancel" },
        ]
      );
    }
  };

  return (
    <View
      style={[
        styles.bubbleContainer,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {/* Sender name for received messages */}
      {!isOwn && (
        <Text style={styles.senderName}>{message.senderId.name}</Text>
      )}

      <View
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {/* Text Message */}
        {message.text && (
          <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
            {message.text}
          </Text>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment, idx) => (
              <View key={idx}>
                {attachment.type === "location" ? (
                  <TouchableOpacity
                    style={[
                      styles.attachmentCard,
                      styles.locationCard,
                    ]}
                    onPress={() => handleLocationPress(attachment)}
                  >
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#FF6B35"
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={styles.locationTitle}
                        numberOfLines={1}
                      >
                        {attachment.landmark}
                      </Text>
                      <Text
                        style={styles.locationSubtitle}
                        numberOfLines={1}
                      >
                        {attachment.areaName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.attachmentCard, styles.fileCard]}>
                    <MaterialIcons
                      name="attach-file"
                      size={20}
                      color="#007AFF"
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={styles.fileTitle}
                        numberOfLines={1}
                      >
                        {attachment.filename}
                      </Text>
                      <Text style={styles.fileSubtitle}>
                        {attachment.fileSize
                          ? `${(attachment.fileSize / 1024).toFixed(2)} KB`
                          : "File"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Timestamp & Read Receipt */}
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
            <Text
              style={[
                styles.readReceipt,
                message.readAt ? styles.readReceiptRead : styles.readReceiptSent,
              ]}
            >
              {message.readAt ? "✓✓" : "✓"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    marginBottom: 2,
  },
  ownContainer: {
    alignItems: "flex-end",
    paddingRight: 12,
    marginBottom: 8,
  },
  otherContainer: {
    alignItems: "flex-start",
    paddingLeft: 12,
    marginBottom: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A5F7A",
    marginBottom: 2,
    marginLeft: 8,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "80%",
  },
  ownBubble: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownText: {
    color: "#111",
  },
  otherText: {
    color: "#111",
  },
  attachmentsContainer: {
    gap: 6,
    marginVertical: 4,
  },
  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  locationCard: {
    backgroundColor: "#f0e6f6",
  },
  fileCard: {
    backgroundColor: "#e6f2ff",
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  locationSubtitle: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  fileTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  fileSubtitle: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
    justifyContent: "flex-end",
  },
  timestamp: {
    fontSize: 11,
  },
  ownTimestamp: {
    color: "#888",
  },
  otherTimestamp: {
    color: "#888",
  },
  readReceipt: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  readReceiptSent: {
    color: "#888",
  },
  readReceiptRead: {
    color: "#0084FF",
  },
});
