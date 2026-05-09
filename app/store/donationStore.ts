import { buildApiUrl } from "../lib/api";
import { apiFetch } from "../lib/apiClient";
import { fromBackendDonationType } from "../lib/donations";

export type DonationRecord = {
  id: string;
  type: "clothes" | "food" | "blood" | "financial";
  title: string;
  recipientName: string;
  amount?: string;
  date: string;
  location: string;
  status: "completed" | "pending" | "in-progress";
  imageUrl?: string;
  distanceKm?: number;
  shortDescription?: string;
  postedAtIso?: string;
};

let donations: DonationRecord[] = [
  {
    id: "1",
    type: "blood",
    title: "Blood Donation - O+",
    recipientName: "City Hospital",
    amount: "1 unit",
    date: "Dec 10, 2024",
    location: "City Hospital, Downtown",
    status: "completed",
  },
  {
    id: "2",
    type: "financial",
    title: "Medical Fund Contribution",
    recipientName: "Sarah's Cancer Treatment",
    amount: "2500 pkr",
    date: "Dec 8, 2024",
    location: "Memorial Hospital",
    status: "completed",
  },
  {
    id: "3",
    type: "clothes",
    title: "Winter Clothes Donation",
    recipientName: "Kids Care NGO",
    amount: "5 items",
    date: "Dec 5, 2024",
    location: "Community Center, North",
    status: "in-progress",
  },
  {
    id: "4",
    type: "food",
    title: "Food Package",
    recipientName: "Hope Shelter",
    amount: "10 kg",
    date: "Dec 3, 2024",
    location: "Hope Shelter, East Side",
    status: "in-progress",
  },
];

type Subscriber = (items: DonationRecord[]) => void;
const subscribers: Subscriber[] = [];

const API_URL = buildApiUrl("/api/donations");

function mapBackendStatus(status: string): DonationRecord["status"] {
  if (status === "completed") {
    return "completed";
  }

  if (status === "available" || status === "pending") {
    return "pending";
  }

  if (status === "matched") {
    return "in-progress";
  }

  return "in-progress";
}

function mapBackendDonation(d: any, fallbackName: string): DonationRecord {
  const desc = d.description || "";
  const title = d.title || desc.split("\n")[0] || "Donation";
  const dateSrc = d.postedAt || d.createdAt;
  const landmark =
    d.landmark ||
    d.location?.landmark ||
    d.location?.address ||
    "Nearby";

  return {
    id: String(d._id),
    type: fromBackendDonationType(d.type),
    title,
    recipientName: fallbackName,
    amount: d.quantityText,
    date: dateSrc ? new Date(dateSrc).toLocaleDateString() : new Date().toLocaleDateString(),
    location: landmark,
    status: mapBackendStatus(d.status || "available"),
    imageUrl: Array.isArray(d.images) && d.images[0] ? d.images[0] : undefined,
    distanceKm: typeof d.distanceKm === "number" ? d.distanceKm : undefined,
    shortDescription: d.shortDescription || desc.split("\n").slice(1).join("\n").trim(),
    postedAtIso: dateSrc ? new Date(dateSrc).toISOString() : undefined,
  };
}

export function getDonations() {
  return donations.slice();
}

export function addDonation(d: Omit<DonationRecord, "id"> | DonationRecord) {
  const id = "id" in d ? d.id : String(Date.now());
  const newDonation: DonationRecord = {
    id,
    status: d.status ?? "pending",
    type: d.type,
    title: d.title,
    recipientName: d.recipientName,
    amount: d.amount,
    date: d.date,
    location: d.location,
    imageUrl: d.imageUrl,
    distanceKm: d.distanceKm,
    shortDescription: d.shortDescription,
    postedAtIso: d.postedAtIso,
  };
  donations = [newDonation, ...donations];
  notifySubscribers();
  return newDonation;
}

/** Browse list without mutating the global donor cache. */
export async function fetchBrowseDonationsDetached(
  lat: number,
  lng: number,
  radiusKm = 50
): Promise<DonationRecord[]> {
  const url = `${buildApiUrl("/api/donations/browse")}?lat=${encodeURIComponent(
    lat
  )}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radiusKm)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Browse API ${response.status}: ${detail.slice(0, 200) || response.statusText || "request failed"}`
    );
  }
  const data = await response.json();
  return data.map((d: any) => mapBackendDonation(d, "Nearby donor"));
}

export async function fetchBrowseDonations(lat: number, lng: number, radiusKm = 50) {
  try {
    const converted = await fetchBrowseDonationsDetached(lat, lng, radiusKm);
    donations = converted;
    notifySubscribers();
    return converted;
  } catch (error) {
    console.error("Error fetching browse donations:", error);
    return donations;
  }
}

export async function fetchNearbyDonations(lat: number, lng: number) {
  try {
    return await fetchBrowseDonations(lat, lng, 50);
  } catch (error) {
    console.error("Error fetching nearby donations:", error);
    return donations;
  }
}

export async function fetchUserDonations(donorId: string) {
  try {
    const response = await apiFetch(`/api/donations/donor/${donorId}`, { userId: donorId });
    if (!response.ok) throw new Error("Failed to fetch user donations");
    const data = await response.json();

    const converted = data.map((d: any) => mapBackendDonation(d, "Recipients"));

    donations = converted;
    notifySubscribers();
    return converted;
  } catch (error) {
    console.error("Error fetching user donations:", error);
    return donations;
  }
}

/** Public listing without mutating in-memory donor cache (e.g. recipient browse fallbacks). */
export async function fetchAvailableDonationsDetached(): Promise<DonationRecord[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Donations API ${response.status}: ${detail.slice(0, 200) || response.statusText}`
    );
  }
  const data = await response.json();
  return data.map((d: any) => mapBackendDonation(d, "Nearby donor"));
}

export async function fetchAllDonations() {
  try {
    const converted = await fetchAvailableDonationsDetached();
    donations = converted;
    notifySubscribers();
    return converted;
  } catch (error) {
    console.error("Error fetching all donations:", error);
    return donations;
  }
}

function notifySubscribers() {
  subscribers.forEach((s) => s(getDonations()));
}

export function subscribe(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}
