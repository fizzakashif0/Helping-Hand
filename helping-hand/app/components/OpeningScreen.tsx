import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type Props = {
  onStart: () => void;
};

export default function OpeningScreen({ onStart }: Props) {
  const router = useRouter();
  const logoAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [logoAnim, pulseAnim]);

  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const logoOpacity = logoAnim;

  const logoStyle = {
    transform: [{ scale: logoScale }],
    opacity: logoOpacity,
  } as any;

  const pulseStyle = { transform: [{ scale: pulseAnim }] } as any;

  const logoSource = require("../../assets/images/icon.png");

  return (
    <View style={[styles.background, styles.gradientBg]}>
      <View style={styles.centerContainer} pointerEvents="box-none">
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.title}>Helping Hand</Text>
          <Text style={styles.subtitle}>Making a difference, one donation at a time</Text>

          <Animated.View style={pulseStyle}>
            <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.smallBtn, styles.outline]}
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
            >
              <Text style={[styles.smallText, styles.outlineText]}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallBtn, styles.solid]}
              onPress={() => router.push("/signup")}
              activeOpacity={0.85}
            >
              <Text style={[styles.smallText, styles.solidText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBg: {
    backgroundColor: "#1A5F7A",
  },
  card: {
    width: Math.min(540, width - 48),
    padding: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0F2141",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#2D9E7A",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: "#2D9E7A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  centerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 80,
    marginBottom: 18,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.72)' : 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 96,
    height: 96,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  outline: {
    borderWidth: 1,
    borderColor: "#2D9E7A",
  },
  solid: {
    backgroundColor: "#2D9E7A",
  },
  smallText: {
    fontSize: 14,
  },
  outlineText: {
    color: "#2D9E7A",
  },
  solidText: {
    color: "#fff",
  },
});
