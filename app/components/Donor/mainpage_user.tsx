
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Bell,
  Heart,
  MapPin,
  TrendingUp
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  DonationRecord,
  fetchAvailableDonationsDetached,
  fetchBrowseDonationsDetached,
} from "../../store/donationStore";
import styles from "../../styles/MainStyle";
import BottomNav, { NavItem } from "../Navbar";
import DonationFeed from "./DonationFeed";
interface DonorHomeProps {
  onNavigate: (screen: string) => void;
}

const mockActiveEvents = [
  {
    id: "1",
    name: "Winter Relief Drive 2024",
    ngo: "Hope Foundation",
    donations: 234,
    goal: 500,
    image: "❄️",
  },
  {
    id: "2",
    name: "Emergency Flood Relief",
    ngo: "Care Together",
    donations: 567,
    goal: 1000,
    image: "🌊",
  },
];

export default function DonorHome({ onNavigate }: DonorHomeProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("home");
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState<DonationRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const loadNearbyRequests = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        const result = await fetchBrowseDonationsDetached(
          pos.coords.latitude,
          pos.coords.longitude,
          50
        );
        setNearbyRequests(result.slice(0, 3));
      } else {
        const fallback = await fetchAvailableDonationsDetached();
        setNearbyRequests(fallback.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load nearby requests:", error);
      try {
        const fallback = await fetchAvailableDonationsDetached();
        setNearbyRequests(fallback.slice(0, 3));
      } catch (fallbackError) {
        console.error("Fallback nearby requests fetch failed:", fallbackError);
      }
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadNearbyRequests();
  }, [loadNearbyRequests]);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Welcome, Donor</Text>
            <Text style={styles.subtitle}>Make a difference today</Text>
          </View>

          <TouchableOpacity 
  style={styles.bell}
  onPress={() => router.push("/notifications")}
>
  <Bell color="white" size={24} />
  <View style={styles.notification}>
    <Text style={styles.notificationText}>!</Text>
  </View>
</TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Donations", value: 12 },
            { label: "Active", value: 8 },
            { label: "Helped", value: 45 },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryBtn]}
          onPress={() => router.push("/create")}
        >
          <Heart color="#1A5F7A" size={24} />
          <Text style={styles.primaryText}>Create Donation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={() => setFeedModalVisible(true)}
        >
          <MapPin color="white" size={24} />
          <Text style={styles.secondaryText}>Browse Requests</Text>
        </TouchableOpacity>
      </View>

      {/* NGO Events */}
      <SectionHeader
        title="vents"
        onPress={() => onNavigate("ngo-events")}
      />

      {mockActiveEvents.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={styles.card}
          onPress={() => onNavigate(`event-details-${event.id}`)}
        >
          <Text style={styles.emoji}>{event.image}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{event.name}</Text>
            <Text style={styles.cardSub}>{event.ngo}</Text>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(event.donations / event.goal) * 100}%` },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {event.donations}/{event.goal}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Nearby Requests */}
      <SectionHeader
        title="Nearby Requests"
        onPress={() => router.push("/donation-feed")}
      />

      {loadingRequests && (
        <Text style={styles.cardSub}>Loading nearby requests...</Text>
      )}

      {!loadingRequests && nearbyRequests.map((donation) => {
        const urgency =
          donation.status === "pending"
            ? "high"
            : donation.status === "in-progress"
            ? "medium"
            : "low";
        const type = donation.type.charAt(0).toUpperCase() + donation.type.slice(1);

        return (
        <TouchableOpacity
          key={donation.id}
          style={styles.card}
          onPress={() => onNavigate(`donation-details-${donation.id}`)}
        >
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                urgency === "high"
                  ? styles.badgeRed
                  : styles.badgeYellow,
              ]}
            >
              <Text style={styles.badgeText}>
                {urgency === "high" ? "Urgent" : urgency === "medium" ? "Medium" : "Low"}
              </Text>
            </View>
            <Text style={styles.typeText}>{type}</Text>
          </View>

          <Text style={styles.cardTitle}>{donation.title}</Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color="#ffffffaa" />
            <Text style={styles.locationText}>{donation.location}</Text>
          </View>
        </TouchableOpacity>
      );
      })}

      {/* Impact */}
      <View style={styles.impactCard}>
        <TrendingUp color="white" size={24} />
        <Text style={styles.cardTitle}>Your Impact</Text>
        <Text style={styles.cardSub}>This month</Text>

        <View style={styles.impactRow}>
          <ImpactItem label="People Helped" value="45" />
          <ImpactItem label="Items Donated" value="128" />
        </View>
      </View>
      </ScrollView>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <Modal
        visible={feedModalVisible}
        animationType="slide"
        onRequestClose={() => setFeedModalVisible(false)}
      >
        <DonationFeed
          onBack={() => setFeedModalVisible(false)}
          onNavigate={onNavigate}
        />
      </Modal>
    </View>
  );
}

/* Helper Components */
function SectionHeader({ title, onPress }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress} style={styles.seeAll}>
        <Text style={styles.seeAllText}>See All</Text>
        <ArrowRight size={14} color="white" />
      </TouchableOpacity>
    </View>
  );
}

function ImpactItem({ label, value }: any) {
  return (
    <View style={styles.impactItem}>
      <Text style={styles.cardSub}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
