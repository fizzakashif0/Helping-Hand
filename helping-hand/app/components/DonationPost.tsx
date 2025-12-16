import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Heart, MessageCircle, Share2, MapPin, Clock } from "lucide-react-native";
import { Button } from "../ui/button";

export type DonationType = "clothes" | "food" | "blood" | "financial";

export interface DonationPostData {
  id: string;
  type: DonationType;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  urgency: "low" | "medium" | "high";
  author: string;
  likes: number;
  comments: number;
}

const typeConfig = {
  clothes: { label: "Clothes", color: "#3b82f6" },
  food: { label: "Food", color: "#22c55e" },
  blood: { label: "Blood", color: "#b91c1c" },
  financial: { label: "Financial", color: "#b45309" }
};

const urgencyConfig = {
  low: { label: "Low", color: "#9ca3af" },
  medium: { label: "Medium", color: "#f97316" },
  high: { label: "Urgent", color: "#dc2626" }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6"
  },
  header: {
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4
  },
  description: {
    fontSize: 14,
    color: "#374151"
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280"
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6"
  },
  statsGroup: {
    flexDirection: "row",
    gap: 20
  },
  statButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  statText: {
    fontSize: 12,
    color: "#4b5563"
  }
});

export function DonationPost({ post }: { post: DonationPostData }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: typeConfig[post.type].color }]}>
            <Text style={styles.badgeText}>{typeConfig[post.type].label}</Text>
          </View>

          {post.urgency === "high" && (
            <View style={[styles.badge, { backgroundColor: urgencyConfig.high.color }]}>
              <Text style={styles.badgeText}>{urgencyConfig.high.label}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={12} color="#6b7280" />
          <Text style={styles.metaText}>{post.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={12} color="#6b7280" />
          <Text style={styles.metaText}>{post.timeAgo}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <View style={styles.statsGroup}>
          <TouchableOpacity style={styles.statButton}>
            <Heart size={16} color="#4b5563" />
            <Text style={styles.statText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statButton}>
            <MessageCircle size={16} color="#4b5563" />
            <Text style={styles.statText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Share2 size={16} color="#4b5563" />
          </TouchableOpacity>
        </View>

        <Button onPress={() => console.log("Donate pressed")}>
          Donate
        </Button>
      </View>
    </View>
  );
}

export default DonationPost;
