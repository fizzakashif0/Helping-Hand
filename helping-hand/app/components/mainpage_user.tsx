import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDonation } from "../store/donationStore";
import styles from "../styles/MainStyle";
import type { DonationType } from "./DonationPost";
import { FilterSheet } from "./FilterSheet";
import BottomNav, { NavItem } from "./Navbar";

interface DonationCardProps {
  category: DonationType;
  urgent?: boolean;
  title: string;
  description: string;
  location: string;
  time: string;
  likes: number;
  comments: number;
}

const DonationCard = ({
  category,
  urgent,
  title,
  description,
  location,
  time,
  likes,
  comments
}: DonationCardProps) => {
  const router = useRouter();
  const categoryStyles: { [key: string]: any } = {
    blood: styles.blood,
    food: styles.food,
    financial: styles.financial,
    clothes: styles.clothes,
  };

  return (
    <View style={styles.card}>
      <View style={styles.tagRow}>
        <View style={[styles.tag, categoryStyles[category]]}>
          <Text style={styles.tagText}>{category}</Text>
        </View>

        {urgent && (
          <View style={[styles.tag, styles.urgent]}>
            <Text style={styles.tagText}>Urgent</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{location}</Text>
        <Text style={styles.metaText}>{time}</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.stats}>
          <TouchableOpacity
            onPress={() => {
              addDonation({
                type: category as any,
                title,
                recipientName: "Saved from feed",
                amount: undefined,
                date: new Date().toLocaleDateString(),
                location,
                status: "pending",
              });
              router.push("/donations" as any);
            }}
          >
            <Ionicons name="bookmark-outline" size={16} />
          </TouchableOpacity>
          <Text style={styles.statText}>{likes}</Text>

          <TouchableOpacity onPress={() => Alert.alert("Comments", `${comments} comments`)}>
            <Ionicons name="chatbubble-outline" size={16} />
          </TouchableOpacity>
          <Text style={styles.statText}>{comments}</Text>

          <TouchableOpacity onPress={() => Alert.alert("Shared!", "Post shared successfully")}>
            <Ionicons name="share-social-outline" size={16} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.requestBtn} onPress={() => Alert.alert("Donate", "Opening donation page...")}>
          <Text style={styles.requestText}>Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HelpingHandHomeScreen() {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<DonationType[]>([]);
  const [activeTab, setActiveTab] = useState<NavItem>("home");

  const handleTypeToggle = (type: DonationType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleClearAll = () => {
    setSelectedTypes([]);
  };

  const feedData: Array<{
    id: string;
    category: DonationType;
    urgent?: boolean;
    title: string;
    description: string;
    location: string;
    time: string;
    likes: number;
    comments: number;
  }> = [
    {
      id: "f1",
      category: "food",
      urgent: false,
      title: "Biryani Available for Distribution",
      description:
        "Freshly cooked chicken biryani is available for 10 people. Can be picked up within the next 2 hours.",
      location: "Gulshan-e-Iqbal, Karachi",
      time: "5 min ago",
      likes: 12,
      comments: 3,
    },
    {
      id: "f2",
      category: "food",
      urgent: false,
      title: "5 Person Meal Available",
      description:
        "Home-cooked meal available for 5 people including rice, curry, and bread. Prefer same-day pickup.",
      location: "Model Town, Lahore",
      time: "20 min ago",
      likes: 20,
      comments: 6,
    },
    {
      id: "f3",
      category: "financial",
      urgent: true,
      title: "Emergency Financial Help Needed",
      description:
        "Daily wage worker needs urgent financial assistance for rent and utilities after job loss.",
      location: "Korangi, Karachi",
      time: "1 hour ago",
      likes: 45,
      comments: 18,
    },
    {
      id: "f4",
      category: "blood",
      urgent: true,
      title: "Urgent Blood Required (B+)",
      description:
        "Patient undergoing surgery needs B+ blood within 24 hours. Any help would be lifesaving.",
      location: "Jinnah Hospital, Lahore",
      time: "30 min ago",
      likes: 60,
      comments: 25,
    },
    {
      id: "f5",
      category: "clothes",
      urgent: false,
      title: "Winter Clothes for Children",
      description:
        "Gently used winter clothes available for children aged 5 to 10. Clean and in good condition.",
      location: "Gulshan-e-Iqbal, Karachi",
      time: "2 hours ago",
      likes: 32,
      comments: 9,
    },
    {
      id: "f6",
      category: "financial",
      urgent: false,
      title: "School Fee Assistance",
      description: "Single mother seeking short-term financial help to pay school fees for two children.",
      location: "Rawalpindi",
      time: "3 hours ago",
      likes: 28,
      comments: 11,
    },
    {
      id: "f7",
      category: "blood",
      urgent: false,
      title: "Regular Blood Donors Needed",
      description: "Hospital requesting voluntary blood donors for upcoming medical procedures.",
      location: "Civil Hospital, Hyderabad",
      time: "5 hours ago",
      likes: 22,
      comments: 7,
    },
    {
      id: "f8",
      category: "clothes",
      urgent: false,
      title: "Winter Clothes Available for Children",
      description: "Gently used winter jackets, sweaters, and shoes available for children aged 5 to 10.",
      location: "F-10, Islamabad",
      time: "1 hour ago",
      likes: 35,
      comments: 8,
    },
    {
      id: "f9",
      category: "financial",
      urgent: false,
      title: "Monthly Grocery Support Available",
      description: "Willing to sponsor monthly groceries for a family in need. NGOs or verified individuals preferred.",
      location: "Saddar, Rawalpindi",
      time: "2 hours ago",
      likes: 28,
      comments: 7,
    },
  ];

  const visibleFeed = feedData.filter((item) =>
    selectedTypes.length > 0 ? selectedTypes.includes(item.category) : true
  );

  return (
    <View style={styles.container}>
      {/* Filter Sheet Modal */}
      <FilterSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        onClearAll={handleClearAll}
      />

      {/* Header */}
      <View style={[styles.header, styles.headerRow]}>
        <View>
          <Text style={styles.headerTitle}>Helping Hand</Text>
          <Text style={styles.headerSubtitle}>
            Making a difference, one donation at a time
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.85}
          onPress={() => setFilterOpen(true)}
        >
          <Ionicons name="funnel" size={18} color="#fff" style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {/* Feed: Available Donations */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {visibleFeed.map((item) => (
          <DonationCard
            key={item.id}
            category={item.category}
            urgent={item.urgent}
            title={item.title}
            description={item.description}
            location={item.location}
            time={item.time}
            likes={item.likes}
            comments={item.comments}
          />
        ))}
      </ScrollView>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </View>
  );
}
