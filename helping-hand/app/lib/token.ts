// Optional token helpers.
// Uses AsyncStorage if installed; otherwise acts as no-ops.

let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
  AsyncStorage = null;
}

const TOKEN_KEY = "auth_token";

export async function setToken(token: string) {
  if (!AsyncStorage) return;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (!AsyncStorage) return null;
  return (await AsyncStorage.getItem(TOKEN_KEY)) as string | null;
}

export async function clearToken() {
  if (!AsyncStorage) return;
  await AsyncStorage.removeItem(TOKEN_KEY);
}


