import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_BACKEND_PORT = "5000";

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `http://${trimmed}`;
}

function readExpoHostUri() {
  const possibleHostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as typeof Constants & {
      manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
    }).manifest2?.extra?.expoClient?.hostUri;

  if (!possibleHostUri) {
    return null;
  }

  return possibleHostUri.split(":")[0] || null;
}

function readWindowHostname() {
  if (typeof globalThis === "undefined" || !("location" in globalThis)) {
    return null;
  }

  const hostname = globalThis.location?.hostname;
  return typeof hostname === "string" && hostname ? hostname : null;
}

export function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  const detectedHost = readExpoHostUri() || readWindowHostname();
  if (detectedHost) {
    if (Platform.OS === "android" && (detectedHost === "localhost" || detectedHost === "127.0.0.1")) {
      return `http://10.0.2.2:${DEFAULT_BACKEND_PORT}`;
    }

    return `http://${detectedHost}:${DEFAULT_BACKEND_PORT}`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  if (Platform.OS === "ios" || Platform.OS === "web") {
    return "http://localhost:5000";
  }

  return null;
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new Error(
      "Backend API URL is not configured. Set EXPO_PUBLIC_API_URL to http://YOUR_LOCAL_IP:5000."
    );
  }

  if (!path.startsWith("/")) {
    return `${baseUrl}/${path}`;
  }

  return `${baseUrl}${path}`;
}
