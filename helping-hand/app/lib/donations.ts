export const DEMO_DONOR_ID = "demo-donor-id";
export const DEMO_REQUESTER_ID = "demo-requester-id";

export type DonationType = "food" | "clothes" | "blood" | "financial";
export type BackendDonationType = "food" | "clothes" | "blood" | "money";

export function toBackendDonationType(type: DonationType): BackendDonationType {
  if (type === "financial") {
    return "money";
  }

  return type;
}

export function fromBackendDonationType(type: string): DonationType {
  if (type === "money" || type === "financial") {
    return "financial";
  }

  if (type === "food" || type === "clothes" || type === "blood") {
    return type;
  }

  return "food";
}
