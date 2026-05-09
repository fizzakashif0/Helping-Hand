import { apiFetch } from "../lib/apiClient";
import { fromBackendDonationType } from "../lib/donations";

export type DonationRequestStatus = "pending" | "accepted" | "rejected" | "completed";

export type DonationRequestRecord = {
  id: string;
  donationId: string;
  donorId: string;
  recipientId: string;
  recipientDisplayName: string;
  status: DonationRequestStatus;
  message?: string;
  createdAt: string;
  donationTitle?: string;
  donationType?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
};

type Subscriber = (items: DonationRequestRecord[]) => void;

const donorSubscribers: Subscriber[] = [];
const recipientSubscribers: Subscriber[] = [];

let incomingForDonor: DonationRequestRecord[] = [];
let myClaimsAsRecipient: DonationRequestRecord[] = [];

function notifyDonor() {
  const snap = incomingForDonor.slice();
  donorSubscribers.forEach((s) => s(snap));
}

function notifyRecipient() {
  const snap = myClaimsAsRecipient.slice();
  recipientSubscribers.forEach((s) => s(snap));
}

export function mapDonationRequest(r: any, _role: "donor" | "recipient"): DonationRequestRecord {
  const donation = r.donation;
  const title =
    donation?.description?.split("\n")[0] ||
    donation?.title ||
    "Donation";

  return {
    id: String(r._id),
    donationId: String(r.donation?._id || r.donation),
    donorId: String(r.donor?._id || r.donor),
    recipientId: String(r.recipient?._id || r.recipient),
    recipientDisplayName: r.recipientDisplayName || "",
    status: (r.status || "pending") as DonationRequestStatus,
    message: r.message,
    createdAt: r.createdAt || new Date().toISOString(),
    donationTitle: title,
    donationType: donation?.type ? fromBackendDonationType(donation.type) : undefined,
    recipientName: r.recipient?.name,
    recipientPhone: r.recipient?.phone,
    recipientEmail: r.recipient?.email,
  };
}

export async function fetchIncomingDonationRequests(donorId: string) {
  const res = await apiFetch(`/api/donation-requests/donor/${donorId}`, { userId: donorId });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Donation requests ${res.status}: ${detail.slice(0, 200) || res.statusText}`
    );
  }
  const data = await res.json();
  incomingForDonor = Array.isArray(data) ? data.map((x: any) => mapDonationRequest(x, "donor")) : [];
  notifyDonor();
  return incomingForDonor;
}

export async function fetchRecipientDonationClaims(recipientId: string) {
  const res = await apiFetch(`/api/donation-requests/recipient/${recipientId}`, {
    userId: recipientId,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Recipient requests ${res.status}: ${detail.slice(0, 200) || res.statusText}`
    );
  }
  const data = await res.json();
  myClaimsAsRecipient = Array.isArray(data)
    ? data.map((x: any) => mapDonationRequest(x, "recipient"))
    : [];
  notifyRecipient();
  return myClaimsAsRecipient;
}

export async function createDonationRequestApi(body: {
  recipientId: string;
  donationId: string;
  recipientDisplayName?: string;
  message?: string;
}) {
  const res = await apiFetch("/api/donation-requests", {
    method: "POST",
    userId: body.recipientId,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: body.recipientId,
      donationId: body.donationId,
      recipientDisplayName: body.recipientDisplayName,
      message: body.message,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Request failed");
  }
  return res.json();
}

export async function updateDonationRequestStatusApi(params: {
  donorId: string;
  requestId: string;
  status: DonationRequestStatus;
}) {
  const res = await apiFetch(`/api/donation-requests/${params.requestId}/status`, {
    method: "PATCH",
    userId: params.donorId,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.donorId,
      status: params.status,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Update failed");
  }
  return res.json();
}

export function getIncomingDonationRequests() {
  return incomingForDonor.slice();
}

export function getRecipientDonationClaims() {
  return myClaimsAsRecipient.slice();
}

export function subscribeIncomingDonationRequests(cb: Subscriber) {
  donorSubscribers.push(cb);
  cb(incomingForDonor.slice());
  return () => {
    const i = donorSubscribers.indexOf(cb);
    if (i >= 0) donorSubscribers.splice(i, 1);
  };
}

export function subscribeRecipientDonationClaims(cb: Subscriber) {
  recipientSubscribers.push(cb);
  cb(myClaimsAsRecipient.slice());
  return () => {
    const i = recipientSubscribers.indexOf(cb);
    if (i >= 0) recipientSubscribers.splice(i, 1);
  };
}
