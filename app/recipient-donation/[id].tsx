import { useLocalSearchParams, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { buildApiUrl } from "../lib/api";
import { timeAgo } from "../lib/timeAgo";
import { getToken } from "../lib/token";
import { DonationRecord, getDonations } from "../store/donationStore";

const typeColors: Record<string, string> = {
  clothes: "#3B82F6",
  food: "#22C55E",
  blood: "#B91C1C",
  financial: "#F59E0B",
};

const statusColors: Record<string, string> = {
  pending: "#F59E0B",
  accepted: "#22C55E",
  rejected: "#DC2626",
  completed: "#6B7280",
  "in-progress": "#2563EB",
};

export default function RecipientDonationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const donationId = params.id as string;
  const [donation, setDonation] = useState<DonationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (donationId) {
      const donations = getDonations();
      const found = donations.find((d) => d.id === donationId);
      setDonation(found || null);
    }
    setLoading(false);
  }, [donationId]);

  const handleContactDonor = async () => {
    if (!donation) return;
    const current = donation;
    setActionLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Please login first");
        return;
      }
      const decoded: any = jwtDecode(token);
      const recipientId = decoded?.sub || decoded?.id;
      if (!recipientId) {
        Alert.alert("Error", "Could not decode user");
        return;
      }
      const donorId =
        (current as any).donorId ||
        (current as any).donor?._id ||
        (current as any).userId;
      if (!donorId) {
        Alert.alert("Error", "Donor not found on this post");
        return;
      }
      const response = await fetch(buildApiUrl("/api/chats"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ donorId, recipientId, donationId: current.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 409) {
        const threadId = data.threadId || data._id;
        if (threadId) {
          router.push(`/chat/${threadId}`);
          return;
        }
      }
      if (!response.ok) throw new Error(data?.message || "Failed to start chat");
      const threadId = data._id || data.threadId || data.id;
      router.push(`/chat/${threadId}`);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to start chat");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestDonation = async () => {
    if (!donation) return;
    const current = donation;
    setActionLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Please login first");
        return;
      }
      const decoded: any = jwtDecode(token);
      const userId = decoded?.sub || decoded?.id;
      const response = await fetch(buildApiUrl("/api/requests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          type: current.type,
          donationId: current.id,
          quantityText: current.amount || "Not specified",
          urgency: "low",
          location: { landmark: current.location },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to send request");
      Alert.alert("Success", "Request sent successfully!");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donation Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color="#1A5F7A" size="large" />
        </View>
      </View>
    );
  }

  if (!donation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donation Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Donation not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donation Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: typeColors[donation.type] ?? "#999" }]}>
            <Text style={styles.badgeText}>
              {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColors[donation.status] ?? "#999" }]}>
            <Text style={styles.badgeText}>{donation.status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{donation.title}</Text>

        {donation.shortDescription ? (
          <Text style={styles.description}>{donation.shortDescription}</Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <User size={18} color="#1A5F7A" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>From</Text>
              <Text style={styles.detailValue}>{donation.recipientName}</Text>
            </View>
          </View>

          {donation.amount ? (
            <View style={styles.detailRow}>
              <Package size={18} color="#1A5F7A" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{donation.amount}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <MapPin size={18} color="#1A5F7A" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{donation.location}</Text>
            </View>
          </View>

          {donation.distanceKm !== undefined ? (
            <View style={styles.detailRow}>
              <MapPin size={18} color="#1A5F7A" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>
                  {donation.distanceKm.toFixed(1)} km away
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Clock size={18} color="#1A5F7A" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Posted</Text>
              <Text style={styles.detailValue}>
                {timeAgo(donation.postedAtIso || donation.date)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Pressable
            style={[styles.primaryBtn, actionLoading && { opacity: 0.6 }]}
            onPress={handleRequestDonation}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Request This Donation</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, actionLoading && { opacity: 0.6 }]}
            onPress={handleContactDonor}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#1A5F7A" />
            ) : (
              <Text style={styles.secondaryBtnText}>Contact Donor</Text>
            )}
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#1A5F7A",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { padding: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  content: { flex: 1, padding: 16 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  description: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 24 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1A1A1A", marginBottom: 16 },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: "#999", marginBottom: 4 },
  detailValue: { fontSize: 14, color: "#1A1A1A", fontWeight: "500" },
  actionSection: { gap: 12 },
  primaryBtn: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#E8F0F5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#1A5F7A", fontSize: 16, fontWeight: "600" },
  errorText: { color: "#B91C1C", fontSize: 16, fontWeight: "500" },
});