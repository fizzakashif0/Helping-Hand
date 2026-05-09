import { buildApiUrl } from "./api";

export type ApiFetchInit = RequestInit & {
  userId?: string;
};

/**
 * Adds demo user id for backends that expect userId in query (global auth middleware).
 */
export async function apiFetch(path: string, init: ApiFetchInit = {}) {
  const { userId, ...rest } = init;
  let url = buildApiUrl(path);
  if (userId && !url.includes("userId=")) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}userId=${encodeURIComponent(userId)}`;
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(rest.headers as Record<string, string>),
  };

  if (userId) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${userId}`;
  }

  return fetch(url, { ...rest, headers });
}
