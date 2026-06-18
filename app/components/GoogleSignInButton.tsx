import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { getGoogleWebClientId, isGoogleSignInConfigured } from '../lib/googleConfig';
import { completeGoogleSignIn } from '../lib/googleAuth';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  disabled?: boolean;
  style?: ViewStyle;
};

const CONFIG_MESSAGE =
  'Google Sign-In is not configured. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to Helping-Hand/.env (same Web Client ID as backend GOOGLE_CLIENT_ID), then restart Expo.';

function GoogleButtonShell({
  disabled,
  style,
  loading,
  onPress,
  buttonDisabled,
}: {
  disabled?: boolean;
  style?: ViewStyle;
  loading: boolean;
  onPress: () => void;
  buttonDisabled: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.socialBtn, style, (disabled || buttonDisabled) && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || buttonDisabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.socialText}>Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/** Shown when env is missing — does not call useAuthRequest (avoids web crash). */
function GoogleSignInButtonUnconfigured({ disabled = false, style }: Props) {
  return (
    <GoogleButtonShell
      disabled={disabled}
      style={style}
      loading={false}
      buttonDisabled={false}
      onPress={() => Alert.alert('Google Sign-In', CONFIG_MESSAGE)}
    />
  );
}

function GoogleSignInButtonConfigured({ disabled = false, style }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const webClientId = getGoogleWebClientId()!;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || webClientId;
  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || webClientId;

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'dismiss' || response.type === 'cancel') {
      setLoading(false);
      return;
    }

    if (response.type !== 'success') {
      if (response.type === 'error') {
        Alert.alert('Google Sign-In', 'Google authentication was cancelled or failed.');
      }
      setLoading(false);
      return;
    }

    const idToken = response.authentication?.idToken;
    if (!idToken) {
      Alert.alert('Google Sign-In', 'No ID token received from Google.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        await completeGoogleSignIn(idToken, router);
      } catch {
        Alert.alert('Google Sign-In', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [response, router]);

  const handlePress = async () => {
    if (!request) {
      Alert.alert('Google Sign-In', 'Google sign-in is not ready yet. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await promptAsync();
    } catch {
      Alert.alert('Google Sign-In', 'Unable to open Google sign-in.');
      setLoading(false);
    }
  };

  return (
    <GoogleButtonShell
      disabled={disabled}
      style={style}
      loading={loading}
      buttonDisabled={!request}
      onPress={handlePress}
    />
  );
}

export function GoogleSignInButton(props: Props) {
  if (!isGoogleSignInConfigured()) {
    return <GoogleSignInButtonUnconfigured {...props} />;
  }
  return <GoogleSignInButtonConfigured {...props} />;
}

const styles = StyleSheet.create({
  socialBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0F2141',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D9E7A',
    gap: 8,
  },
  socialText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
});
