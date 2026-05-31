import { buildApiUrl } from "./api";
import { getToken } from "./token";

export async function apiFetch(
  path: string,
  options?: Record<string, any>
): Promise<Response> {
  const url = buildApiUrl(path);
  
  // Get token if available
  const token = await getToken();
  
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...((options?.headers as Record<string, string>) || {}),
    },
  };

  // Add Authorization header if token exists
  if (token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Omit custom options from fetch call
  const { headers, ...restOptions } = options || {};
  
  return fetch(url, { ...fetchOptions, ...restOptions });
}
