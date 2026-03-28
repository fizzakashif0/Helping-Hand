import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0E4A61",
  },
  header: {
    backgroundColor: "#1A5F7A",
    padding: 20,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#ffffffaa",
  },
  bell: {
    position: "relative",
  },
  notification: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "red",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  statCard: {
    backgroundColor: "#ffffff22",
    padding: 12,
    borderRadius: 12,
    width: "30%",
    alignItems: "center",
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#ffffffaa",
    fontSize: 12,
  },
  quickActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: "white",
  },
  secondaryBtn: {
    backgroundColor: "#ffffff22",
    borderWidth: 1,
    borderColor: "#ffffff55",
  },
  primaryText: {
    color: "#1A5F7A",
    fontWeight: "600",
  },
  secondaryText: {
    color: "white",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    alignItems: "center",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  seeAllText: {
    color: "#ffffffaa",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#ffffff22",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 8,
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  cardSub: {
    color: "#ffffffaa",
    fontSize: 12,
  },
  cardDesc: {
    fontSize: 14,
    color: "#555",
  },
  progressBar: {
    backgroundColor: "#ffffff44",
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  progressFill: {
    backgroundColor: "white",
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    color: "#ffffffaa",
    fontSize: 10,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeRed: {
    backgroundColor: "red",
  },
  badgeYellow: {
    backgroundColor: "orange",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
  },
  typeText: {
    color: "#ffffffaa",
    fontSize: 12,
  },
  locationRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  food: { backgroundColor: "#2e7d32" },
  financial: { backgroundColor: "#f9a825" },
  clothes: { backgroundColor: "#1976d2" },
  urgent: { backgroundColor: "#ff5722" },
  metaRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: "#ffffffaa",
    fontSize: 12,
  },
  impactCard: {
    backgroundColor: "#ffffff22",
    margin: 16,
    padding: 16,
    borderRadius: 14,
    gap: 6,
  },
  impactRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  impactItem: {
    flex: 1,
    backgroundColor: "#ffffff22",
    padding: 12,
    borderRadius: 12,
  },
});

export default styles;

