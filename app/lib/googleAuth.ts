import type { Router } from 'expo-router';
import { Alert } from 'react-native';
import { apiFetch } from './apiClient';
import { normalizeUserRole } from './authRole';
import { parseApiResponse } from './parseApiResponse';
import { saveToken } from './token';
import { setUserRole } from '../store/userStore';

interface GoogleAuthResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    [key: string]: unknown;
  };
  requiresRoleSelection?: boolean;
  message?: string;
}

export async function completeGoogleSignIn(
  idToken: string,
  router: Router
): Promise<void> {
  const response = await apiFetch('/api/auth/google-login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });

  const { ok, data } = await parseApiResponse<GoogleAuthResponse>(response);

  if (!ok) {
    Alert.alert(
      'Google Sign-In Failed',
      data.message || 'Unable to sign in with Google. Please try again.'
    );
    return;
  }

  if (data.token) {
    await saveToken(data.token);
  }

  setUserRole(normalizeUserRole(data.user?.role ?? null));

  if (data.requiresRoleSelection) {
    router.push('/role-selection');
    return;
  }

  router.push('/home');
}
