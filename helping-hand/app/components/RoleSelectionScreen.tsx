import {
    Building2,
    HandHeart,
    Heart,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface RoleSelectionProps {
  onRoleSelect: (role: "donor" | "recipient" | "ngo") => void;
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View style={[styles.logoWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <HandHeart size={48} color="white" />
      </Animated.View>

      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>Select how you'd like to make a difference</Text>

      {/* Donor */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => onRoleSelect("donor")}
      >
        <View style={styles.iconBox}>
          <Heart color="white" size={28} />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>I want to Donate</Text>
          <Text style={styles.cardDesc}>Provide help through donations</Text>
        </View>
      </TouchableOpacity>

      {/* Recipient */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => onRoleSelect("recipient")}
      >
        <View style={styles.iconBox}>
          <HandHeart color="white" size={28} />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>I need Help</Text>
          <Text style={styles.cardDesc}>Request assistance with dignity</Text>
        </View>
      </TouchableOpacity>

      {/* NGO */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => onRoleSelect("ngo")}
      >
        <View style={styles.iconBox}>
          <Building2 color="white" size={28} />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>NGO / Organization</Text>
          <Text style={styles.cardDesc}>Organize events and campaigns</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E4A61",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoWrapper: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 20,
    borderRadius: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: "white",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    width: "100%",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 14,
    alignItems: "center",
  },
  iconBox: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 14,
    borderRadius: 12,
    marginRight: 14,
  },
  textBox: {
    flex: 1,
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 2,
  },
  cardDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
});
