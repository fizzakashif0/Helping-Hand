import { buildApiUrl } from "./api";

export async function apiFetch(
  path: string,
  options?: Record<string, any>
): Promise<Response> {
  const url = buildApiUrl(path);
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...((options?.headers as Record<string, string>) || {}),
    },
  };

  // Omit custom options from fetch call
  const { headers, ...restOptions } = options || {};
  
  return fetch(url, { ...fetchOptions, ...restOptions });
}
