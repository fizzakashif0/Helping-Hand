export type ApiMessageBody = {
  message?: string;
  [key: string]: unknown;
};

/**
 * Reads response body safely so auth screens never fail silently on non-JSON errors.
 */
export async function parseApiResponse<T extends ApiMessageBody = ApiMessageBody>(
  response: Response
): Promise<{ ok: boolean; status: number; data: T }> {
  const text = await response.text();

  if (!text) {
    return { ok: response.ok, status: response.status, data: {} as T };
  }

  try {
    const data = JSON.parse(text) as T;
    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: response.ok,
      status: response.status,
      data: { message: text } as T,
    };
  }
}
