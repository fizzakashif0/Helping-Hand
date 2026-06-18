import { LinearGradient } from "expo-linear-gradient";
import { HandHeart, Heart } from "lucide-react-native";
import React from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
interface RoleSelectionProps {
  onRoleSelect: (role: "donor" | "recipient") => void;
}
export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const logoAnim = React.useRef(new Animated.Value(0)).current;
  const titleAnim = React.useRef(new Animated.Value(0)).current;
  const subtitleAnim = React.useRef(new Animated.Value(0)).current;
  const card1Anim = React.useRef(new Animated.Value(0)).current;
  const card2Anim = React.useRef(new Animated.Value(0)).current;
  const backAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backAnim, card1Anim, card2Anim, logoAnim, pulseAnim, subtitleAnim, titleAnim]);
  return (
    <LinearGradient
      colors={["#1A5F7A", "#0E4A61", "#082F3E"]}
      style={styles.container}
    >
      {/* Animated background circle */}
      <Animated.View
        style={[
          styles.bgCircle,
          {
            transform: [{ scale: pulseAnim }],
            opacity: 0.3,
          },
        ]}
      />
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoAnim,
            transform: [
              {
                scale: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.logo}>
          <HandHeart size={64} color="#fff" />
        </View>
      </Animated.View>
      {/* Title */}
      <Animated.Text style={[styles.title, { opacity: titleAnim }]}>
        Choose Your Role
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: subtitleAnim }]}>
        Select how you'd like to make a difference
      </Animated.Text>
      {/* Cards */}
      <View style={styles.cards}>
        <Animated.View
          style={[
            styles.cardAnimWrap,
            {
              opacity: card1Anim,
              transform: [
                {
                  translateX: card1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <RoleCard
            icon={<Heart size={32} color="#fff" />}
            title="I want to Donate"
            subtitle="Provide help through donations"
            onPress={() => onRoleSelect("donor")}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.cardAnimWrap,
            {
              opacity: card2Anim,
              transform: [
                {
                  translateX: card2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <RoleCard
            icon={<HandHeart size={32} color="#fff" />}
            title="I need Help"
            subtitle="Request assistance with dignity"
            onPress={() => onRoleSelect("recipient")}
          />
        </Animated.View>
      </View>
      {/* Back */}
      <Animated.Text style={[styles.back, { opacity: backAnim }]}>
        Back
      </Animated.Text>
    </LinearGradient>
  );
}
function RoleCard({
  icon,
  title,
  subtitle,
  onPress,
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
    paddingHorizontal: 24,
  },
  bgCircle: {
    position: "absolute",
    top: 80,
    left: 40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logoWrap: {
    marginBottom: 32,
  },
  logo: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 24,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },
  cards: {
    width: "100%",
    gap: 16,
  },
  cardAnimWrap: {
    width: "100%",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 20,
  },
  iconBox: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 16,
    borderRadius: 14,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  back: {
    marginTop: 32,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
});