import { buildApiUrl } from "../lib/api";
import {
  AppDonationType,
  DEMO_REQUESTER_ID,
  fromBackendDonationType,
  toBackendDonationType,
} from "../lib/donations";

export type RequestRecord = {
  id: string;
  type: AppDonationType;
  title: string;
  description: string;
  quantity?: string;
  location: string;
  urgency: "low" | "medium" | "high";
  status: "pending" | "approved" | "completed" | "rejected";
  date: string;
  requesterName: string;
  distanceKm?: number;
};

type Subscriber = (items: RequestRecord[]) => void;

const API_URL = buildApiUrl("/api/requests");
const subscribers: Subscriber[] = [];

let requests: RequestRecord[] = [];

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber(getRequests()));
}

function mapBackendRequest(request: any): RequestRecord {
  const fullMessage = request.message || "";
  const [titleLine, ...descriptionLines] = fullMessage.split("\n");

  return {
    id: request._id,
    type: fromBackendDonationType(request.type),
    title: titleLine || "Help Request",
    description: descriptionLines.join("\n") || titleLine || "No details provided",
    quantity: request.quantityText || "Not specified",
    location: request.location?.address || "Not specified",
    urgency: request.urgency || "medium",
    status: request.status || "pending",
    date: new Date(request.createdAt).toLocaleDateString(),
    requesterName: "Recipient",
    distanceKm:
      typeof request.distanceKm === "number"
        ? Number(request.distanceKm.toFixed(1))
        : undefined,
  };
}

export function getRequests() {
  return requests.slice();
}

export function addRequest(request: RequestRecord) {
  requests = [request, ...requests];
  notifySubscribers();
  return request;
}

export async function createRequest(payload: {
  type: AppDonationType;
  title: string;
  description: string;
  quantity?: string;
  location: string;
  urgency: "low" | "medium" | "high";
}) {
  const requestData = {
    userId: DEMO_REQUESTER_ID,
    type: toBackendDonationType(payload.type),
    message: `${payload.title}\n${payload.description}`,
    quantityText: payload.quantity || "Not specified",
    location: {
      address: payload.location || "Not specified",
      coordinates: {
        lat: 31.5497,
        lng: 74.3436,
      },
    },
    urgency: payload.urgency,
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create request: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const newRequest = mapBackendRequest(result);
  addRequest(newRequest);
  return newRequest;
}

export async function fetchMyRequests(requesterId: string = DEMO_REQUESTER_ID) {
  const response = await fetch(`${API_URL}/requester/${requesterId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch requests");
  }

  const data = await response.json();
  requests = data.map(mapBackendRequest);
  notifySubscribers();
  return getRequests();
}

export async function fetchNearbyRequests(lat: number, lng: number, radius = 50) {
  const response = await fetch(
    `${buildApiUrl("/api/nearby-requests")}?lat=${lat}&lng=${lng}&radius=${radius}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nearby requests");
  }

  const data = await response.json();
  return data.map(mapBackendRequest);
}

export function subscribeRequests(cb: Subscriber) {
  subscribers.push(cb);

  return () => {
    const index = subscribers.indexOf(cb);
    if (index >= 0) {
      subscribers.splice(index, 1);
    }
  };
}
