import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiFetch } from './lib/apiClient';
import { parseApiResponse } from './lib/parseApiResponse';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = typeof tokenParam === 'string' ? tokenParam : tokenParam?.[0];
    if (!token) {
      setStatus('idle');
      return;
    }

    (async () => {
      setStatus('loading');
      try {
        const response = await apiFetch('/api/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        const { ok, data } = await parseApiResponse<{ message?: string }>(response);

        if (!ok) {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired verification link');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully. You can now log in.');
      } catch {
        setStatus('error');
        setMessage('Unable to verify email. Please try again.');
      }
    })();
  }, [tokenParam]);

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      const { ok, data } = await parseApiResponse<{ message?: string; verificationUrl?: string }>(
        response
      );

      if (!ok) {
        Alert.alert('Error', data.message || 'Unable to resend verification email.');
        return;
      }

      const devHint =
        __DEV__ && data.verificationUrl
          ? `\n\nDev link:\n${data.verificationUrl}`
          : '';
      Alert.alert('Verification Email', (data.message || 'If applicable, a new link has been sent.') + devHint);
    } catch {
      Alert.alert('Error', 'Unable to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>

      {status === 'loading' && <ActivityIndicator size="large" color="#fff" />}

      {status === 'success' && (
        <>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'error' && (
        <>
          <Text style={styles.errorMessage}>{message}</Text>
          <Text style={styles.hint}>Request a new verification link:</Text>
          <TextInput
            placeholder="Your email"
            value={resendEmail}
            onChangeText={setResendEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleResend}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Resend verification email</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {status === 'idle' && (
        <>
          <Text style={styles.message}>
            Open the verification link from your email, or paste the token below if you received one.
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/login')}>
            <Text style={styles.linkText}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#1A5F7A',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  errorMessage: {
    color: '#FCA5A5',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  hint: {
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2D9E7A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#0F2141',
  },
  button: {
    backgroundColor: '#2D9E7A',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
