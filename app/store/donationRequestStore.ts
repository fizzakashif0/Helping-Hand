import { buildApiUrl } from "../lib/api";
import { apiFetch } from "../lib/apiClient";

export type DonationRequestRecord = {
  id: string;
  type: "clothes" | "food" | "blood" | "financial";
  title: string;
  recipientName: string;
  amount?: string;
  date: string;
  location: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "matched";
  requesterMessage?: string;
  donationId?: string;
};

let donationRequests: DonationRequestRecord[] = [];

type Subscriber = (items: DonationRequestRecord[]) => void;
const subscribers: Subscriber[] = [];

const API_URL = buildApiUrl("/api/donationRequests");

function mapBackendDonationRequest(d: any): DonationRequestRecord {
  const donation = d.donation || {};
  const recipient = d.recipient || {};
  const desc = donation.description || "";
  const title = donation.title || desc.split("\n")[0] || "Donation Request";
  const dateSrc = d.createdAt;
  const landmark =
    donation.landmark ||
    donation.location?.landmark ||
    donation.location?.address ||
    "Nearby";

  return {
    id: String(d._id),
    type: (donation.type === "money" ? "financial" : donation.type) || "food",
    title,
    recipientName: d.recipientDisplayName || recipient.name || "Recipient",
    amount: donation.quantityText,
    date: dateSrc ? new Date(dateSrc).toLocaleDateString() : new Date().toLocaleDateString(),
    location: landmark,
    status: d.status || "pending",
    requesterMessage: d.message,
    donationId: String(donation._id),
  };
}

export function getIncomingDonationRequests() {
  return donationRequests.slice();
}

export async function fetchIncomingDonationRequests(donorId: string) {
  try {
    const response = await apiFetch(`/api/donationRequests/donor/${donorId}`, {
      userId: donorId,
    });
    if (!response.ok) throw new Error("Failed to fetch incoming donation requests");
    const data = await response.json();

    const converted = data.map((d: any) => mapBackendDonationRequest(d));

    donationRequests = converted;
    notifySubscribers();
    return converted;
  } catch (error) {
    console.error("Error fetching incoming donation requests:", error);
    return donationRequests;
  }
}

export async function updateDonationRequestStatusApi(payload: {
  donorId: string;
  requestId: string;
  status: "accepted" | "rejected";
}) {
  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(payload.requestId)}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: payload.status,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update donation request status: ${response.statusText}`);
    }

    const updated = await response.json();

    // Update local state
    const index = donationRequests.findIndex((r) => r.id === payload.requestId);
    if (index >= 0) {
      donationRequests[index] = mapBackendDonationRequest(updated);
      notifySubscribers();
    }

    return updated;
  } catch (error) {
    console.error("Error updating donation request status:", error);
    throw error;
  }
}

function notifySubscribers() {
  subscribers.forEach((s) => s(getIncomingDonationRequests()));
}

export function subscribeIncomingDonationRequests(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}
