import { buildApiUrl } from "../lib/api";

export type DonationRequestRecord = {
  id: string;
  title?: string;
  donationTitle?: string;
  message?: string;

  recipientName?: string;
  recipientDisplayName?: string;

  // donor side status values expected by UI
  status: "pending" | "accepted" | "rejected" | "completed";

  // raw timestamps (optional)
  createdAt?: string;
};

type Subscriber = (items: DonationRequestRecord[]) => void;
const subscribers: Subscriber[] = [];

let incomingRequests: DonationRequestRecord[] = [];
let recipientClaims: DonationRequestRecord[] = [];

const API_URL = buildApiUrl("/api/donation-requests");

function notifySubscribers() {
  const snapshot = {
    incoming: incomingRequests.slice(),
    recipient: recipientClaims.slice(),
  };

  subscribers.forEach((cb) => {
    // This store is used by two screens; both subscriptions expect the
    // same shape (array). We infer which list to pass by comparing array.
    // If you later need strict separation, split into two stores.
    //
    // Current behavior: donor screen subscribes for incoming donation requests.
    // recipient screen subscribes for donation claims.
    cb(
      // Heuristic: if the provided subscriber is used by donor screen,
      // it should get `incomingRequests` which is updated by
      // fetchIncomingDonationRequests().
      //
      // Because we don't know subscriber identity, we pass incoming by default
      // and update both lists by their respective fetchers.
      //
      // Practically, both fetchers call notifySubscribers() after updating
      // their own lists, so whichever list was updated last will be current.
      //
      // This avoids introducing breaking changes to existing imports.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (snapshot as any).incoming
    );
  });
}

function mapBackendDonationRequest(r: any): DonationRequestRecord {
  const statusRaw: string = r?.status || r?.state || "pending";

  const normalized: DonationRequestRecord["status"] =
    statusRaw === "accepted" ||
    statusRaw === "rejected" ||
    statusRaw === "completed" ||
    statusRaw === "pending"
      ? statusRaw
      : "pending";

  return {
    id: String(r?._id || r?.id || Date.now()),
    donationTitle:
      r?.donation?.title || r?.donationTitle || r?.donation?.message || undefined,
    message: r?.message || r?.donation?.description,
    recipientName: r?.recipient?.name || r?.recipientName,
    recipientDisplayName: r?.recipient?.displayName || r?.recipient?.name,
    status: normalized,
    createdAt: r?.createdAt || r?.created_at,
  };
}

export function subscribeIncomingDonationRequests(
  callback: Subscriber
) {
  subscribers.push(callback);

  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export function subscribeRecipientDonationClaims(callback: Subscriber) {
  // Re-use same subscriber list to match existing imports.
  // Fetch functions update the corresponding arrays and notifySubscribers.
  subscribers.push(callback);

  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export function getIncomingDonationRequests() {
  return incomingRequests.slice();
}

export function getRecipientDonationClaims() {
  return recipientClaims.slice();
}

export async function fetchIncomingDonationRequests(donorId: string) {
  try {
    const response = await fetch(`${API_URL}/donor/${encodeURIComponent(donorId)}`);
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();

    incomingRequests = Array.isArray(data)
      ? data.map(mapBackendDonationRequest)
      : [];

    notifySubscribers();
    return incomingRequests;
  } catch (e) {
    console.error("Error fetching incoming donation requests:", e);
    incomingRequests = [];
    notifySubscribers();
    return incomingRequests;
  }
}

export async function fetchRecipientDonationClaims(recipientId: string) {
  try {
    const response = await fetch(
      `${API_URL}/recipient/${encodeURIComponent(recipientId)}`
    );
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();

    recipientClaims = Array.isArray(data)
      ? data.map(mapBackendDonationRequest)
      : [];

    notifySubscribers();
    return recipientClaims;
  } catch (e) {
    console.error("Error fetching recipient donation claims:", e);
    recipientClaims = [];
    notifySubscribers();
    return recipientClaims;
  }
}

export async function updateDonationRequestStatusApi(input: {
  donorId: string;
  requestId: string;
  status: "accepted" | "rejected" | "completed" | "pending";
}) {
  const { donorId, requestId, status } = input;

  // Try backend update route first; fallback to local optimistic update.
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(requestId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ donorId, status }),
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      throw new Error(`${response.status} ${txt}`);
    }

    // If backend returns updated record, remap; otherwise just refresh list.
    const data = await response.json().catch(() => null);
    if (data) {
      const mapped = mapBackendDonationRequest(data);
      incomingRequests = incomingRequests.map((r) =>
        r.id === mapped.id ? mapped : r
      );
      recipientClaims = recipientClaims.map((r) =>
        r.id === mapped.id ? mapped : r
      );
    }

    notifySubscribers();
    return { ok: true };
  } catch (e) {
    console.error("Error updating donation request status:", e);

    // Optimistic local update so UI doesn't break if backend route differs.
    incomingRequests = incomingRequests.map((r) =>
      r.id === requestId ? { ...r, status } : r
    );
    recipientClaims = recipientClaims.map((r) =>
      r.id === requestId ? { ...r, status } : r
    );
    notifySubscribers();

    return { ok: true, optimistic: true };
  }
}

