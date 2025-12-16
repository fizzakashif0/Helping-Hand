import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e60000",
  },

  header: {
    backgroundColor:"#e60000" ,
    padding: 20
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 1.5,
    fontFamily: "serif"
  },
headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},
  filterBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.12)",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },

  filterIcon: {
    opacity: 0.95
  },

  headerSubtitle: {
    color: "#fff",
    fontSize: 13,
    marginTop: 4
  },

  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 14,
    borderRadius: 12
  },

  tagRow: {
    flexDirection: "row",
    marginBottom: 6
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6
  },

  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },

  blood: { backgroundColor: "#d32f2f" },
  food: { backgroundColor: "#2e7d32" },
  financial: { backgroundColor: "#f9a825" },
  urgent: { backgroundColor: "#c62828" },

  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 8,
    color: "#1a1a1a",
    letterSpacing: 0.5
  },

  cardDesc: {
    fontSize: 14,
    color: "#555"
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8
  },

  metaText: {
    fontSize: 12,
    color: "#777"
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12
  },

  stats: {
    flexDirection: "row",
    alignItems: "center"
  },

  statText: {
    marginHorizontal: 6,
    fontSize: 12
  },

  requestBtn: {
    backgroundColor: "#e60000",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20
  },

  requestText: {
    color: "#fff",
    fontWeight: "bold"
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff"
  }
});

export default styles;
