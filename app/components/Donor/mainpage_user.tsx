import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Bell,
  MapPin,
  Plus,
  TrendingUp
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  DonationRecord,
  fetchAvailableDonationsDetached,
  fetchBrowseDonationsDetached,
} from "../../store/donationStore";
import BottomNav, { NavItem } from "../Navbar";
import DonationFeed from "./DonationFeed";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

interface DonorHomeProps {
  onNavigate: (screen: string) => void;
}

export default function DonorHome({ onNavigate }: DonorHomeProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("home");
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState<DonationRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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
        console.error("Fallback fetch failed:", fallbackError);
      }
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/events/public`);
      if (res.ok) {
        const data = await res.json();
        setActiveEvents(data.events ?? []);
      }
    } catch (_) {}
    finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    loadNearbyRequests();
    loadEvents();
  }, [loadNearbyRequests, loadEvents]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome, Donor</Text>
              <Text style={styles.subWelcomeText}>Make a difference today</Text>
            </View>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push("/notifications")}
            >
              <Bell size={24} color="white" />
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>3</Text>
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
              <View key={item.label} style={styles.statBox}>
                <Text style={styles.statNum}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButtonWhite}
            onPress={() => router.push("/create")}
          >
            <Plus size={24} color="#1A5F7A" />
            <Text style={styles.actionButtonTextBlue}>Create Donation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonGhost}
            onPress={() => setFeedModalVisible(true)}
          >
            <MapPin size={24} color="white" />
            <Text style={styles.actionButtonTextWhite}>Browse Requests</Text>
          </TouchableOpacity>
        </View>

        {/* NGO Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NGO Events</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => onNavigate("ngo-events")}
          >
            <Text style={styles.seeAllText}>See All </Text>
            <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {loadingEvents && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        )}

        {!loadingEvents && activeEvents.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active NGO events right now</Text>
            <Text style={styles.emptySubtext}>Check back soon!</Text>
          </View>
        )}

        {!loadingEvents && activeEvents.map((event) => (
          <TouchableOpacity
            key={event._id}
            style={styles.card}
            onPress={() => router.push(`/event-details/${event._id}` as any)}
          >
            <View style={styles.cardContent}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emojiText}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{event.name}</Text>
                <Text style={styles.cardSubtitle}>{event.ngoName}</Text>
                <Text style={styles.cardStats}>
                  {event.participants}/{event.targetParticipants || "?"} participants
                  {event.startDate ? ` • ${event.startDate}` : ""}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Nearby Requests */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Nearby Requests</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push("/donation-feed")}
          >
            <Text style={styles.seeAllText}>See All </Text>
            <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {loadingRequests && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading nearby requests...</Text>
          </View>
        )}

        {!loadingRequests && nearbyRequests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No nearby requests</Text>
            <Text style={styles.emptySubtext}>Check back soon!</Text>
          </View>
        )}

        {!loadingRequests && nearbyRequests.map((donation) => {
          const urgency = donation.status === "pending" ? "high"
            : donation.status === "in-progress" ? "medium" : "low";
          const type = donation.type.charAt(0).toUpperCase() + donation.type.slice(1);

          return (
            <TouchableOpacity
              key={donation.id}
              style={styles.card}
              onPress={() => onNavigate(`donation-details-${donation.id}`)}
            >
              <View style={styles.badgeRow}>
                <View style={[
                  styles.typeBadge,
                  urgency === "high" ? styles.badgeRed : styles.badgeYellow
                ]}>
                  <Text style={styles.typeBadgeText}>
                    {urgency === "high" ? "Urgent" : urgency === "medium" ? "Medium" : "Low"}
                  </Text>
                </View>
                <Text style={styles.locationText}>{donation.location}</Text>
              </View>
              <Text style={styles.cardTitle}>{donation.title}</Text>
              <Text style={styles.cardSubtitle}>{type}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Impact Card */}
        <TouchableOpacity style={[styles.card, { marginTop: 24 }]}>
          <View style={styles.statusHeader}>
            <View style={styles.calendarIconBg}>
              <TrendingUp size={24} color="white" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Your Impact</Text>
              <Text style={styles.cardSubtitle}>This month</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>45</Text>
              <Text style={styles.statLabel}>People Helped</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>128</Text>
              <Text style={styles.statLabel}>Items Donated</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>12</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
          </View>
        </TouchableOpacity>

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
    </SafeAreaView>
  );
}

function SectionHeader({ title, onPress }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress} style={styles.seeAllBtn}>
        <Text style={styles.seeAllText}>See All </Text>
        <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A5F7A',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subWelcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  bellButton: {
    padding: 8,
  },
  badgeCount: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  statNum: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -15,
    gap: 12,
  },
  actionButtonWhite: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonGhost: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 8,
  },
  actionButtonTextBlue: {
    color: '#1A5F7A',
    fontWeight: '600',
  },
  actionButtonTextWhite: {
    color: 'white',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 28,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  cardStats: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRed: {
    backgroundColor: '#EF4444',
  },
  badgeYellow: {
    backgroundColor: '#F59E0B',
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarIconBg: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },
  loadingContainer: {
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  emptyContainer: {
    marginHorizontal: 20,
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});