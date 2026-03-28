import {
    Clock,
    Heart,
    MapPin,
    MessageCircle,
    Share2
} from "lucide-react-native";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export type DonationType = "clothes" | "food" | "blood" | "financial";

export interface DonationPostData {
  id: string;
  type: DonationType;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  urgency: "low" | "medium" | "high";
  author?: string;
  likes: number;
  comments: number;
}

const typeConfig = {
  clothes: { label: "Clothes", color: "#3B82F6" },
  food: { label: "Food", color: "#22C55E" },
  blood: { label: "Blood", color: "#B91C1C" },
  financial: { label: "Financial", color: "#F59E0B" }
};

const urgencyConfig = {
  low: { label: "Low", color: "#6B7280" },
  medium: { label: "Medium", color: "#F97316" },
  high: { label: "Urgent", color: "#DC2626" }
};

export function DonationPost({ post }: { post: DonationPostData }) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: typeConfig[post.type].color }
            ]}
          >
            <Text style={styles.badgeText}>
              {typeConfig[post.type].label}
            </Text>
          </View>

          {post.urgency === "high" && (
            <View
              style={[
                styles.badge,
                { backgroundColor: urgencyConfig.high.color }
              ]}
            >
              <Text style={styles.badgeText}>
                {urgencyConfig.high.label}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      {/* Meta info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.metaText}>{post.location}</Text>
        </View>

        <View style={styles.metaItem}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.metaText}>{post.timeAgo}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={18} color="#4B5563" />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={18} color="#4B5563" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.donateButton}>
          <Text style={styles.donateText}>Donate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 3
  },

  header: {
    marginBottom: 8
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },

  badgeText: {
    color: "#FFFFFF",
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
    fontSize: 13,
    color: "#374151"
  },

  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 10
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },

  metaText: {
    fontSize: 12,
    color: "#6B7280"
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10
  },

  leftActions: {
    flexDirection: "row",
    gap: 16
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },

  actionText: {
    fontSize: 13,
    color: "#4B5563"
  },

  donateButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8
  },

  donateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600"
  }
});

export default DonationPost;
