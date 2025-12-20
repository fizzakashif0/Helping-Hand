import { LinearGradient } from "expo-linear-gradient";
import {
    Building2,
    HandHeart,
    Heart
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    FadeIn,
    FadeInLeft,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from "react-native-reanimated";

interface RoleSelectionProps {
  onRoleSelect: (role: "donor" | "recipient" | "ngo") => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const pulse = useSharedValue(1);

  pulse.value = withRepeat(
    withTiming(1.2, { duration: 4000 }),
    -1,
    true
  );

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.3
  }));

  return (
    <LinearGradient
      colors={["#1A5F7A", "#0E4A61", "#082F3E"]}
      style={styles.container}
    >
      {/* Animated background circle */}
      <Animated.View
        style={[styles.bgCircle, pulseStyle]}
      />

      {/* Logo */}
      <Animated.View entering={ZoomIn.duration(500)} style={styles.logoWrap}>
        <View style={styles.logo}>
          <HandHeart size={64} color="#fff" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={FadeIn.delay(200)}
        style={styles.title}
      >
        Choose Your Role
      </Animated.Text>

      <Animated.Text
        entering={FadeIn.delay(300)}
        style={styles.subtitle}
      >
        Select how you'd like to make a difference
      </Animated.Text>

      {/* Cards */}
      <View style={styles.cards}>
        <Animated.View entering={FadeInLeft.delay(400)}>
          <RoleCard
            icon={<Heart size={32} color="#fff" />}
            title="I want to Donate"
            subtitle="Provide help through donations"
            onPress={() => onRoleSelect("donor")}
          />
        </Animated.View>

        <Animated.View entering={FadeInLeft.delay(500)}>
          <RoleCard
            icon={<HandHeart size={32} color="#fff" />}
            title="I need Help"
            subtitle="Request assistance with dignity"
            onPress={() => onRoleSelect("recipient")}
          />
        </Animated.View>

        <Animated.View entering={FadeInLeft.delay(600)}>
          <RoleCard
            icon={<Building2 size={32} color="#fff" />}
            title="NGO / Organization"
            subtitle="Organize events and campaigns"
            onPress={() => onRoleSelect("ngo")}
          />
        </Animated.View>
      </View>

      {/* Back */}
      <Animated.Text
        entering={FadeIn.delay(800)}
        style={styles.back}
      >
        Back
      </Animated.Text>
    </LinearGradient>
  );
}

function RoleCard({
  icon,
  title,
  subtitle,
  onPress
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },

  bgCircle: {
    position: "absolute",
    top: 80,
    left: 40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.08)"
  },

  logoWrap: {
    marginBottom: 32
  },

  logo: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 24,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)"
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center"
  },

  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40
  },

  cards: {
    width: "100%",
    gap: 16
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 20
  },

  iconBox: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 16,
    borderRadius: 14
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },

  cardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13
  },

  back: {
    marginTop: 32,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14
  }
});
