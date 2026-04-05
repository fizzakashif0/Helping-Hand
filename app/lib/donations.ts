export type AppDonationType = "clothes" | "food" | "blood" | "financial";

export const DEMO_DONOR_ID = "507f1f77bcf86cd799439011";
export const DEMO_REQUESTER_ID = "507f191e810c19729de860ea";

export function toBackendDonationType(type: AppDonationType) {
  return type === "financial" ? "money" : type;
}

export function fromBackendDonationType(type: string): AppDonationType {
  return type === "money" ? "financial" : (type as AppDonationType);
}
