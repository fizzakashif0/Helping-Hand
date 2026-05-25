import { useLocalSearchParams, useRouter } from "expo-router";
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
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { timeAgo } from "../lib/timeAgo";
import { DonationRecord, getDonations } from "../store/donationStore";

export default function RecipientDonationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const donationId = params.id as string;
  const [donation, setDonation] = useState<DonationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (donationId) {
      const donations = getDonations();
      const found = donations.find((d) => d.id === donationId);
      setDonation(found || null);
    }
    setLoading(false);
  }, [donationId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donation Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.content, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator color="#1A5F7A" size="large" />
        </View>
      </View>
    );
  }

  if (!donation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donation Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.content, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={styles.errorText}>Donation not found</Text>
        </View>
      </View>
    );
  }

  const statusColors = {
    completed: "#16A34A",
    pending: "#FACC15",
    "in-progress": "#2563EB",
  };

  const typeColors = {
    clothes: "#3B82F6",
    food: "#22C55E",
    blood: "#B91C1C",
    financial: "#F59E0B",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donation Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Donation Type Badge */}
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: typeColors[donation.type] },
            ]}
          >
            <Text style={styles.badgeText}>
              {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: statusColors[donation.status] },
            ]}
          >
            <Text style={styles.badgeText}>{donation.status}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{donation.title}</Text>

        {/* Description */}
        {donation.shortDescription && (
          <Text style={styles.description}>{donation.shortDescription}</Text>
        )}

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          {/* Donor */}
          <View style={styles.detailRow}>
            <User size={18} color="#1A5F7A" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>From</Text>
              <Text style={styles.detailValue}>{donation.recipientName}</Text>
            </View>
          </View>

          {/* Amount */}
          {donation.amount && (
            <View style={styles.detailRow}>
              <Package size={18} color="#1A5F7A" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{donation.amount}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.detailRow}>
            <MapPin size={18} color="#1A5F7A" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{donation.location}</Text>
            </View>
          </View>

          {/* Distance */}
          {donation.distanceKm !== undefined && (
            <View style={styles.detailRow}>
              <MapPin size={18} color="#1A5F7A" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>
                  {donation.distanceKm.toFixed(1)} km away
                </Text>
              </View>
            </View>
          )}

          {/* Posted Date */}
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

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Request This Donation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Contact Donor</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#1A5F7A",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  actionSection: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#1A5F7A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryBtn: {
    backgroundColor: "#E8F0F5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#1A5F7A",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "500",
  },
});
