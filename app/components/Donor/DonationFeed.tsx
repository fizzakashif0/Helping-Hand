import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft,
  Clock,
  Filter,
  Heart,
  MapPin,
  MessageCircle,
  User,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { buildApiUrl } from "../../lib/api";
import { getToken } from "../../lib/token";
import {
  DonationRecord,
  fetchAllRequestsDetached,
  fetchNearbyRequestsDetached,
} from "../../store/donationStore";

interface DonationFeedProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export default function DonationFeed({ onNavigate, onBack }: DonationFeedProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [requests, setRequests] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DonationRecord | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        const result = await fetchNearbyRequestsDetached(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setRequests(result);
      } else {
        const fallback = await fetchAllRequestsDetached();
        setRequests(fallback);
      }
    } catch (error) {
      console.error("Failed to load help requests:", error);
      try {
        const fallback = await fetchAllRequestsDetached();
        setRequests(fallback);
      } catch (fallbackError) {
        console.error("Fallback requests fetch failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case "high": return styles.urgentHigh;
      case "medium": return styles.urgentMedium;
      default: return styles.urgentLow;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Food": return styles.typeFood;
      case "Clothes": return styles.typeClothes;
      case "Blood": return styles.typeBlood;
      case "Financial": return styles.typeFinancial;
      default: return styles.typeDefault;
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      selectedFilter === "all" ||
      req.type === selectedFilter.toLowerCase()
  );

  const openModal = (request: DonationRecord) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const handleContactRecipient = async () => {
    if (!selectedRequest) return;
    setChatLoading(true);
    console.log("=== FULL REQUEST OBJECT ===", JSON.stringify(selectedRequest));  // ← add karo
  
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const decoded: any = jwtDecode(token);
      const senderId = decoded?.id || decoded?.sub;
      if (!senderId) throw new Error("Could not decode user");

      // Get sender's username (try multiple sources)
      const senderUsername = decoded?.name || decoded?.username || "Donor";

      const recipientId =
        (selectedRequest as any).recipientId ||
        (selectedRequest as any).recipient?._id ||
        (selectedRequest as any).userId;
  console.log("=== IDs ===", { senderId, recipientId, postId: selectedRequest.id }); // ← add karo
      const postId = selectedRequest.id;
      const postTitle = selectedRequest.title;

      // Call the chat requests API
      const response = await fetch(buildApiUrl("/api/chat-requests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
       
        body: JSON.stringify({
  donorId: recipientId,    // post owner (help-request creator) — notification yahan jaani chahiye
  recipientId: senderId,   // logged-in donor jo help offer kar raha hai
  donationId: postId,
}),
      });
    
console.log("=== RESPONSE STATUS ===", response.status); //
      const data = await response.json().catch(() => ({}));
      console.log("=== RESPONSE DATA ===", data);

      if (!response.ok) throw new Error(data?.message || "Failed to send request");

      Alert.alert("Success", "Request sent! Wait for their response.");
      closeModal();
    } catch (error: any) {
      console.error("Contact recipient error:", error);
      Alert.alert("Error", error?.message || "Failed to send request");
    } finally {
      setChatLoading(false);
    }
  };

  // Helper: compute urgency + timeAgo for a request
  const getRequestMeta = (request: DonationRecord) => {
    const postedAtMs = request.postedAtIso
      ? new Date(request.postedAtIso).getTime()
      : 0;
    const diffMinutes = postedAtMs
      ? Math.max(1, Math.floor((Date.now() - postedAtMs) / 60000))
      : 0;
    const timeAgoStr = !postedAtMs
      ? ""
      : diffMinutes < 60
      ? `${diffMinutes} min ago`
      : `${Math.floor(diffMinutes / 60)} hour${Math.floor(diffMinutes / 60) === 1 ? "" : "s"} ago`;
    const urgency =
      request.status === "pending"
        ? "high"
        : request.status === "in-progress"
        ? "medium"
        : "low";
    const distance =
      typeof request.distanceKm === "number"
        ? `${request.distanceKm.toFixed(1)} km`
        : "";
    return { timeAgoStr, urgency, distance };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Nearby Requests</Text>
            <Text style={styles.headerSubtitle}>Based on your location</Text>
          </View>
          <TouchableOpacity>
            <Filter color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {["all", "Food", "Clothes", "Blood", "Financial"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <ScrollView contentContainerStyle={styles.feed}>
        {loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading requests...</Text>
          </View>
        )}

        {!loading &&
          filteredRequests.map((request) => {
            const type =
              request.type.charAt(0).toUpperCase() + request.type.slice(1);
            const { timeAgoStr, urgency, distance } = getRequestMeta(request);

            return (
              <TouchableOpacity
                key={request.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => {
                  router.push({
                    pathname: "/post",
                    params: {
                      type: request.type,
                      title: request.title,
                      description: request.shortDescription || "",
                      location: request.location,
                      timeAgo: timeAgoStr,
                      urgency,
                    },
                  });
                }}
              >
                {/* Badges */}
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, getTypeStyle(type)]}>
                    <Text style={styles.badgeText}>{type}</Text>
                  </View>
                  <View style={[styles.badge, getUrgencyStyle(urgency)]}>
                    <Text style={styles.badgeText}>
                      {urgency === "high"
                        ? "Urgent"
                        : urgency === "medium"
                        ? "Medium"
                        : "Low"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{request.title}</Text>
                <Text style={styles.cardDesc}>
                  {request.shortDescription || ""}
                </Text>
                <Text style={styles.cardRequester}>
                  by {request.recipientName}
                </Text>

                {/* Location + Time */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {distance
                        ? `${request.location} - ${distance}`
                        : request.location}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{timeAgoStr}</Text>
                  </View>
                </View>

                {/* Help Now Button — opens modal */}
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => openModal(request)}
                >
                  <Heart size={16} color="white" />
                  <Text style={styles.helpButtonText}>Help Now</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

        {!loading && filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No requests found in this category
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Help Now Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (() => {
              const type =
                selectedRequest.type.charAt(0).toUpperCase() +
                selectedRequest.type.slice(1);
              const { timeAgoStr, urgency, distance } =
                getRequestMeta(selectedRequest);

              return (
                <>
                  {/* Type badge */}
                  <View style={styles.modalBadgeRow}>
                    <View style={[styles.badge, getTypeStyle(type)]}>
                      <Text style={styles.badgeText}>{type}</Text>
                    </View>
                    <View style={[styles.badge, getUrgencyStyle(urgency)]}>
                      <Text style={styles.badgeText}>
                        {urgency === "high"
                          ? "Urgent"
                          : urgency === "medium"
                          ? "Medium"
                          : "Low"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalItemTitle}>
                    {selectedRequest.title}
                  </Text>

                  {selectedRequest.shortDescription ? (
                    <Text style={styles.modalDesc}>
                      {selectedRequest.shortDescription}
                    </Text>
                  ) : null}

                  {/* Meta info */}
                  <View style={styles.modalMetaBlock}>
                    <View style={styles.modalMetaRow}>
                      <User size={14} color="#1A5F7A" />
                      <Text style={styles.modalMetaText}>
                        {selectedRequest.recipientName || "Anonymous"}
                      </Text>
                    </View>
                    <View style={styles.modalMetaRow}>
                      <MapPin size={14} color="#1A5F7A" />
                      <Text style={styles.modalMetaText}>
                        {distance
                          ? `${selectedRequest.location} · ${distance}`
                          : selectedRequest.location}
                      </Text>
                    </View>
                    <View style={styles.modalMetaRow}>
                      <Clock size={14} color="#1A5F7A" />
                      <Text style={styles.modalMetaText}>{timeAgoStr}</Text>
                    </View>
                  </View>
                </>
              );
            })()}

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.modalContactBtn}
              onPress={handleContactRecipient}
              disabled={chatLoading}
            >
              {chatLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MessageCircle size={16} color="#fff" />
                  <Text style={styles.modalContactText}>Contact Recipient</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={closeModal}
              disabled={chatLoading}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E4A61" },

  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#1A5F7A",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: { color: "white", fontSize: 20 },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  filterRow: { marginTop: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "white" },
  filterText: { color: "white", fontSize: 13 },
  filterTextActive: { color: "#1A5F7A" },

  feed: { padding: 20, paddingBottom: 100 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "500", color: "white" },

  typeFood: { backgroundColor: "#22C55E" },
  typeClothes: { backgroundColor: "#3B82F6" },
  typeBlood: { backgroundColor: "#EF4444" },
  typeFinancial: { backgroundColor: "#F59E0B" },
  typeDefault: { backgroundColor: "#E5E7EB" },

  urgentHigh: { backgroundColor: "#EF4444" },
  urgentMedium: { backgroundColor: "#F59E0B" },
  urgentLow: { backgroundColor: "#3B82F6" },

  cardTitle: { color: "#1A5F7A", fontSize: 16, marginBottom: 4 },
  cardDesc: { color: "#4B5563", fontSize: 13, marginBottom: 6 },
  cardRequester: { color: "#6B7280", fontSize: 12, marginBottom: 10 },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },

  helpButton: {
    backgroundColor: "#1A5F7A",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  helpButtonText: { color: "white", fontSize: 14 },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "white" },

  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A5F7A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  modalMetaBlock: {
    backgroundColor: "#F0F7FA",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 18,
  },
  modalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalMetaText: {
    fontSize: 13,
    color: "#374151",
    flexShrink: 1,
  },
  modalContactBtn: {
    backgroundColor: "#1A5F7A",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  modalContactText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  modalCancelBtn: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
});