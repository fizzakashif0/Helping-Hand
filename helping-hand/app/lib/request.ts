// Centralized request helper for React Native (Expo)
// - Automatically adds Authorization: Bearer <jwt> from AsyncStorage when available
// - Parses JSON error responses and throws a useful Error

import { Platform } from "react-native";

let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  // AsyncStorage package might not be installed/typed yet.
  AsyncStorage = null;
}

type ApiError = Error & { status?: number; data?: any };

const TOKEN_KEY = "auth_token";


async function getToken(): Promise<string | null> {
  if (!AsyncStorage) return null;
  try {
    return (await AsyncStorage.getItem(TOKEN_KEY)) as string | null;
  } catch {
    return null;
  }
}

export async function setToken(token: string) {
  if (!AsyncStorage) return;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  if (!AsyncStorage) return;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function request(
  method: string,
  url: string,
  body?: any,
  extraHeaders?: Record<string, string>
) {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err: ApiError = new Error(
      data?.error || data?.message || `Request failed with ${res.status}`
    );
    err.status = res.status;
    err.data = data;

    // Helpful for debugging on device
    if (Platform.OS !== "web") {
      // no-op; keep consistent
    }

    throw err;
  }

  return data;
}

