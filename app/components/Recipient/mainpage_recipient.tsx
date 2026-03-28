import { useRouter } from "expo-router";
import {
    ArrowRight,
    Bell,
    Calendar,
    HandHeart,
    Search,
    Shield
} from "lucide-react-native";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BottomNav, { NavItem } from "../Navbar";

interface RecipientHomeProps {
  onNavigate: (screen: string) => void;
}

const mockNearbyDonations = [
  { id: "1", type: "Food", title: "Fresh groceries available", location: "1.5 km away", donor: "Anonymous Donor" },
  { id: "2", type: "Clothes", title: "Winter clothes for families", location: "2.8 km away", donor: "Community Helper" },
];

const mockActiveEvents = [
  { id: "1", name: "Winter Relief Drive 2024", ngo: "Hope Foundation", requests: 234, available: 266, image: "❄️" },
  { id: "2", name: "Emergency Flood Relief", ngo: "Care Together", requests: 567, available: 433, image: "🌊" },
];

export const RecipientHome = ({ onNavigate }: RecipientHomeProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavItem>("home");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.subWelcomeText}>We're here to help</Text>
            </View>
            <TouchableOpacity 
              style={styles.bellButton}
              onPress={() => router.push("/recipient-notifications")}
            >
              <Bell size={24} color="white" />
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Privacy Badge */}
          <View style={styles.privacyCard}>
            <Shield size={24} color="white" />
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>Your Privacy is Protected</Text>
              <Text style={styles.privacyDesc}>All requests are confidential. Your dignity matters.</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButtonWhite}
            onPress={() => router.push("/browse-donations")}
          >
            <Search size={24} color="#1A5F7A" />
            <Text style={styles.actionButtonTextBlue}>Browse Help</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButtonGhost}
            onPress={() => router.push("/create-help-request")}
          >
            <HandHeart size={24} color="white" />
            <Text style={styles.actionButtonTextWhite}>Request Help</Text>
          </TouchableOpacity>
        </View>

        {/* NGO Events Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active NGO Relief Programs</Text>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push("/donations")}>
            <Text style={styles.seeAllText}>See All </Text>
            <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {mockActiveEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.card} onPress={() => onNavigate(`event-details-${event.id}`)}>
            <View style={styles.cardContent}>
              <View style={styles.emojiContainer}><Text style={styles.emojiText}>{event.image}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{event.name}</Text>
                <Text style={styles.cardSubtitle}>{event.ngo}</Text>
                <Text style={styles.cardStats}>{event.available} items available • {event.requests} requests</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Nearby Donations */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Available Nearby</Text>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push("/browse-donations")}>
            <Text style={styles.seeAllText}>View All </Text>
            <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {mockNearbyDonations.map((donation) => (
          <TouchableOpacity key={donation.id} style={styles.card} onPress={() => onNavigate(`recipient-donation-details-${donation.id}`)}>
            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{donation.type}</Text></View>
              <Text style={styles.locationText}>{donation.location}</Text>
            </View>
            <Text style={styles.cardTitle}>{donation.title}</Text>
            <Text style={styles.cardSubtitle}>from {donation.donor}</Text>
          </TouchableOpacity>
        ))}

        {/* Status Dashboard */}
        <TouchableOpacity 
          style={[styles.card, { marginTop: 24 }]}
          onPress={() => router.push("/my-requests")}
        >
          <View style={styles.statusHeader}>
            <View style={styles.calendarIconBg}><Calendar size={24} color="white" /></View>
            <View>
              <Text style={styles.cardTitle}>Your Requests</Text>
              <Text style={styles.cardSubtitle}>Track your help requests</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}><Text style={styles.statNum}>2</Text><Text style={styles.statLabel}>Active</Text></View>
            <View style={styles.statBox}><Text style={styles.statNum}>5</Text><Text style={styles.statLabel}>Fulfilled</Text></View>
            <View style={styles.statBox}><Text style={styles.statNum}>1</Text><Text style={styles.statLabel}>Pending</Text></View>
          </View>
        </TouchableOpacity>

      </ScrollView>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A5F7A', // Background gradient color
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
  privacyCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  privacyTitle: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 2,
  },
  privacyDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
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
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  },
  calendarIconBg: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
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
});