import { buildApiUrl } from "../lib/api";
import { fromBackendDonationType } from "../lib/donations";

export type RequestRecord = {
  id: string;
  type: "clothes" | "food" | "blood" | "financial";
  title: string;
  description: string;
  requesterName?: string;
  amount?: string;
  date: string;
  location: string;
  urgency: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "completed" | "matched";
};

let requests: RequestRecord[] = [
  {
    id: "1",
    type: "food",
    title: "Emergency Food Help",
    description: "Family needs urgent food supplies",
    requesterName: "Ahmad",
    amount: "5 days",
    date: "Dec 10, 2024",
    location: "South District",
    urgency: "high",
    status: "pending",
  },
  {
    id: "2",
    type: "blood",
    title: "Blood Required - O+",
    description: "Patient needs blood transfusion urgently",
    requesterName: "Hospital Admin",
    amount: "2 units",
    date: "Dec 9, 2024",
    location: "City Hospital",
    urgency: "high",
    status: "matched",
  },
  {
    id: "3",
    type: "clothes",
    title: "Winter Clothes Needed",
    description: "Need warm clothes for winter season",
    requesterName: "Fatima",
    amount: "Multiple items",
    date: "Dec 8, 2024",
    location: "North Quarter",
    urgency: "medium",
    status: "pending",
  },
];

type Subscriber = (items: RequestRecord[]) => void;
const subscribers: Subscriber[] = [];

const API_URL = buildApiUrl("/api/requests");

function mapBackendStatus(status: string): RequestRecord["status"] {
  const validStatuses: RequestRecord["status"][] = [
    "pending",
    "approved",
    "rejected",
    "completed",
    "matched",
  ];

  if (validStatuses.includes(status as any)) {
    return status as RequestRecord["status"];
  }

  return "pending";
}

function mapBackendRequest(r: any): RequestRecord {
  return {
    id: r._id || r.id,
    type: fromBackendDonationType(r.type),
    title: r.message?.split("\n")[0] || "Help Request",
    description: r.message || r.description || "",
    requesterName: r.requester?.name || "Anonymous",
    amount: r.quantityText || "Not specified",
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    location: r.location?.address || "Not specified",
    urgency: r.urgency || "medium",
    status: mapBackendStatus(r.status),
  };
}

export function getRequests(): RequestRecord[] {
  return requests;
}

export function addRequest(request: Omit<RequestRecord, "id" | "date">) {
  const newRequest: RequestRecord = {
    ...request,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
  };

  requests.unshift(newRequest);
  notifySubscribers();
  return newRequest;
}

export async function fetchMyRequests(requesterId: string) {
  try {
    const response = await fetch(`${API_URL}/requester/${requesterId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch requests: ${response.status}`);
    }

    const data = await response.json();
    requests = Array.isArray(data) ? data.map(mapBackendRequest) : [];
    notifySubscribers();
  } catch (error) {
    console.error("Error fetching requests:", error);
  }
}

export async function fetchAllRequests() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch requests: ${response.status}`);
    }

    const data = await response.json();
    requests = Array.isArray(data) ? data.map(mapBackendRequest) : [];
    notifySubscribers();
  } catch (error) {
    console.error("Error fetching all requests:", error);
  }
}

export async function createRequest(requestData: {
  type: "clothes" | "food" | "blood" | "financial";
  title?: string;
  description: string;
  quantity?: string;
  location?: string;
  urgency?: "low" | "medium" | "high";
}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "demo-requester-id", // Using demo ID for now
        type: requestData.type === "financial" ? "money" : requestData.type,
        message: requestData.description,
        quantityText: requestData.quantity || "Not specified",
        location: {
          address: requestData.location || "Not specified",
        },
        urgency: requestData.urgency || "medium",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create request: ${response.status} ${error}`);
    }

    const newRequest = await response.json();
    const mappedRequest = mapBackendRequest(newRequest);
    requests.unshift(mappedRequest);
    notifySubscribers();

    return mappedRequest;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
}

export function subscribeRequests(callback: Subscriber) {
  subscribers.push(callback);

  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

function notifySubscribers() {
  subscribers.forEach((callback) => callback(requests));
}
