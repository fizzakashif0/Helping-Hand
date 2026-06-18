/** Web client ID from Google Cloud Console (OAuth 2.0 Web application). */
export function getGoogleWebClientId(): string | undefined {
  const id = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  return id || undefined;
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(getGoogleWebClientId());
}
