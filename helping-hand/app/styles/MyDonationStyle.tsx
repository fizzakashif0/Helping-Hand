import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    backgroundColor: '#1A5F7A',
    padding: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#fee2e2",
    fontSize: 13,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor:'#2a7795ff',
    borderRadius: 12,
    padding: 16,
  },
  statLabel: { color: "#fee2e2", fontSize: 12 },
  statValue: { color: "#fff", fontSize: 22, marginTop: 4 },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeTab: {
    color: '#1A5F7A',
    borderBottomWidth: 2,
    borderBottomColor: '#1A5F7A',
  },

  list: { padding: 16 },

  card: {
    backgroundColor: '#d7dadbff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardSubtitle: { fontSize: 12, color: "#6b7280" },
  amount: { color: "#dc2626", fontWeight: "600" },

  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: { fontSize: 11, color: "#6b7280" },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 40,
  },
});

export default styles;