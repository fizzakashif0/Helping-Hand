import { buildApiUrl } from "../lib/api";
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

  return "in-progress";
}

function mapBackendDonation(d: any, recipientName: string): DonationRecord {
  return {
    id: d._id,
    type: fromBackendDonationType(d.type),
    title: d.description?.split("\n")[0] || "Donation",
    recipientName,
    amount: d.quantityText || d.quantity,
    date: new Date(d.createdAt).toLocaleDateString(),
    location: d.location?.address || "Not specified",
    status: mapBackendStatus(d.status)
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
  };
  donations = [newDonation, ...donations];
  notifySubscribers();
  return newDonation;
}

export async function fetchNearbyDonations(lat: number, lng: number) {
  try {
    const response = await fetch(`${API_URL}/nearby/${lat}/${lng}`);
    if (!response.ok) throw new Error("Failed to fetch nearby donations");
    const data = await response.json();

    const converted = data.map((d: any) => mapBackendDonation(d, "Nearby Donor"));

    donations = converted;
    notifySubscribers();
    return converted;
  } catch (error) {
    console.error("Error fetching nearby donations:", error);
    return donations;
  }
}

export async function fetchUserDonations(donorId: string) {
  try {
    const response = await fetch(`${API_URL}/donor/${donorId}`);
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

export async function fetchAllDonations() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch donations");
    const data = await response.json();

    const converted = data.map((d: any) => mapBackendDonation(d, "Nearby Donor"));

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
