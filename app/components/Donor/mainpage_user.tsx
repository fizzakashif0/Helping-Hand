import { useRouter } from "expo-router";
import {
  ArrowRight,
  Bell,
  Heart,
  MapPin,
  TrendingUp
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import styles from "../../styles/MainStyle";
import { RequestRecord, fetchNearbyRequests } from "../../store/requestStore";
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
    image: "Event",
  },
  {
    id: "2",
    name: "Emergency Flood Relief",
    ngo: "Care Together",
    donations: 567,
    goal: 1000,
    image: "Relief",
  },
];

export default function DonorHome({ onNavigate }: DonorHomeProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("home");
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState<RequestRecord[]>([]);

  useEffect(() => {
    loadNearbyRequests();
  }, []);

  const loadNearbyRequests = async () => {
    try {
      const requests = await fetchNearbyRequests(31.5497, 74.3436, 50);
      setNearbyRequests(requests);
    } catch (error) {
      console.error("Failed to load nearby requests:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Welcome, Donor</Text>
            <Text style={styles.subtitle}>Make a difference today</Text>
          </View>

          <TouchableOpacity style={styles.bell}>
            <Bell color="white" size={24} />
            <View style={styles.notification}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

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

      <SectionHeader
        title="Active NGO Events"
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

      <SectionHeader
        title="Nearby Requests"
        onPress={() => router.push("/donation-feed")}
      />

      {nearbyRequests.slice(0, 2).map((request) => (
        <TouchableOpacity
          key={request.id}
          style={styles.card}
          onPress={() => onNavigate(`donation-details-${request.id}`)}
        >
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                request.urgency === "high"
                  ? styles.badgeRed
                  : styles.badgeYellow,
              ]}
            >
              <Text style={styles.badgeText}>
                {request.urgency === "high" ? "Urgent" : request.urgency === "medium" ? "Medium" : "Low"}
              </Text>
            </View>
            <Text style={styles.typeText}>{request.type}</Text>
          </View>

          <Text style={styles.cardTitle}>{request.title}</Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color="#ffffffaa" />
            <Text style={styles.locationText}>
              {request.location}
              {request.distanceKm !== undefined ? ` • ${request.distanceKm} km away` : ""}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

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
