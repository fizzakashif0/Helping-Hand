import {
    Award,
    Bell,
    Calendar,
    ChevronRight,
    Heart,
    HelpCircle,
    Info,
    LogOut,
    Settings,
    Shield,
    TrendingUp,
    User,
} from "lucide-react-native";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface DonorProfileProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const donorStats = {
  totalDonations: 45,
  activeDonations: 8,
  peopleHelped: 156,
  impactScore: 92,
  joinedDate: "Jan 2024",
  monthlyDonations: [
    { month: "Oct", count: 12 },
    { month: "Nov", count: 15 },
    { month: "Dec", count: 18 },
  ],
};

export default function DonorProfile({
  onNavigate,
  onLogout,
}: DonorProfileProps) {
  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      description: "Update your personal information",
      screen: "edit-profile",
      color: "#1A5F7A",
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Manage your account preferences",
      screen: "account-settings",
      color: "#4B5563",
    },
    {
      icon: Bell,
      label: "Notification Preferences",
      description: "Customize your notifications",
      screen: "notification-preferences",
      color: "#2563EB",
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Control your privacy settings",
      screen: "privacy-settings",
      color: "#16A34A",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help and contact support",
      screen: "help-support",
      color: "#7C3AED",
    },
    {
      icon: Info,
      label: "About",
      description: "App information and terms",
      screen: "about",
      color: "#6B7280",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>
          Manage your account and view your impact
        </Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileWrapper}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <User size={36} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>John Donor</Text>
              <Text style={styles.email}>donor@example.com</Text>
              <Text style={styles.joined}>
                Member since {donorStats.joinedDate}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.editBtn}
            onPress={() => onNavigate("edit-profile")}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>

      {/* Impact Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <Pressable style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color="#1A5F7A" />
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <Heart size={20} color="#fff" />
            <Text style={styles.statLabel}>Total Donations</Text>
            <Text style={styles.statValue}>{donorStats.totalDonations}</Text>
            <Text style={styles.statSub}>
              +{donorStats.monthlyDonations[2].count} this month
            </Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={20} color="#16A34A" />
            <Text style={styles.statLabelDark}>Active</Text>
            <Text style={styles.statValueDark}>
              {donorStats.activeDonations}
            </Text>
            <Text style={styles.statSubDark}>In progress</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={20} color="#D97706" />
            <Text style={styles.statLabelDark}>People Helped</Text>
            <Text style={styles.statValueDark}>
              {donorStats.peopleHelped}
            </Text>
            <Text style={styles.statSubDark}>Lives impacted</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={20} color="#2563EB" />
            <Text style={styles.statLabelDark}>Impact Score</Text>
            <Text style={styles.statValueDark}>
              {donorStats.impactScore}%
            </Text>
            <Text style={styles.statSubDark}>Excellent!</Text>
          </View>
        </View>

        {/* Monthly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Activity</Text>

          <View style={styles.chartRow}>
            {donorStats.monthlyDonations.map((item) => {
              const height = (item.count / 20) * 100;
              return (
                <View key={item.month} style={styles.chartItem}>
                  <View style={styles.chartBarBg}>
                    <View
                      style={[
                        styles.chartBar,
                        { height: `${height}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartMonth}>{item.month}</Text>
                  <Text style={styles.chartCount}>{item.count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.screen}
              style={[
                styles.menuRow,
                index !== menuItems.length - 1 && styles.borderBottom,
              ]}
              onPress={() => onNavigate(item.screen)}
            >
              <View style={styles.menuIcon}>
                <item.icon size={20} color={item.color} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
              </View>

              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <LogOut size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    backgroundColor: "#1A5F7A",
    padding: 24,
    paddingTop: 50,
    paddingBottom: 100,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "600" },
  headerSub: { color: "#E5E7EB", marginTop: 4 },

  profileWrapper: { marginTop: -70, paddingHorizontal: 16 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  profileRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1A5F7A",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontWeight: "600", fontSize: 16 },
  email: { color: "#6B7280", fontSize: 12 },
  joined: { color: "#9CA3AF", fontSize: 11 },

  editBtn: {
    backgroundColor: "#1A5F7A",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editBtnText: { color: "#fff", fontWeight: "600" },

  section: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontWeight: "600", fontSize: 16 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { color: "#1A5F7A", fontSize: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
  },
  statPrimary: { backgroundColor: "#1A5F7A" },
  statLabel: { color: "#E5E7EB", fontSize: 12 },
  statValue: { color: "#fff", fontSize: 28, fontWeight: "600" },
  statSub: { color: "#CBD5E1", fontSize: 11 },

  statLabelDark: { color: "#6B7280", fontSize: 12 },
  statValueDark: { color: "#111827", fontSize: 28, fontWeight: "600" },
  statSubDark: { color: "#9CA3AF", fontSize: 11 },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  chartTitle: { fontWeight: "500", marginBottom: 12 },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
  },
  chartItem: { flex: 1, alignItems: "center" },
  chartBarBg: {
    width: "70%",
    height: "100%",
    backgroundColor: "#E5E7EB",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "100%",
    backgroundColor: "#1A5F7A",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chartMonth: { fontSize: 11, color: "#6B7280", marginTop: 6 },
  chartCount: { fontSize: 11, color: "#111827" },

  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 12,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: { fontWeight: "500" },
  menuDesc: { fontSize: 12, color: "#6B7280" },

  logoutBtn: {
    backgroundColor: "#FEE2E2",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoutText: { color: "#DC2626", fontWeight: "600" },
});
