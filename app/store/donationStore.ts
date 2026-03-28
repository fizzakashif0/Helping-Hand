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
  {
    id: "5",
    type: "financial",
    title: "Education Fund",
    recipientName: "Bright Future Orphanage",
    amount: "$100",
    date: "Dec 1, 2024",
    location: "Bright Future Orphanage",
    status: "completed",
  },
  {
    id: "6",
    type: "food",
    title: "Meal Delivery",
    recipientName: "Sunshine Care Home",
    amount: "20 meals",
    date: "Nov 28, 2024",
    location: "Sunshine Care Home",
    status: "in-progress",
  },
  {
    id: "7",
    type: "clothes",
    title: "Professional Attire",
    recipientName: "Employment Aid",
    amount: "3 suits",
    date: "Nov 25, 2024",
    location: "Career Center, West",
    status: "pending",
  },
];

type Subscriber = (items: DonationRecord[]) => void;
const subscribers: Subscriber[] = [];

export function getDonations() {
  return donations.slice();
}

export function addDonation(d: Omit<DonationRecord, "id" | "status"> & { status?: DonationRecord["status"] }) {
  const id = String(Date.now());
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
  subscribers.forEach((s) => s(getDonations()));
  return newDonation;
}

export function subscribe(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}
