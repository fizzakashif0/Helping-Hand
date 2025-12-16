import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import styles from "../styles/MainStyle";
import { Ionicons } from "@expo/vector-icons";
import { FilterSheet } from "./FilterSheet";
import type { DonationType } from "./DonationPost";

interface DonationCardProps {
  category: string;
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
  const categoryStyles: { [key: string]: any } = {
    blood: styles.blood,
    food: styles.food,
    financial: styles.financial,
    urgent: styles.urgent,
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
          <TouchableOpacity onPress={() => Alert.alert("Liked!", `${likes} people liked this`)}>
            <Ionicons name="heart-outline" size={16} />
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<DonationType[]>([]);

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

  <DonationCard
    category="food"
    urgent={false}
    title="Biryani Available for Distribution"
    description="Freshly cooked chicken biryani is available for 10 people. Can be picked up within the next 2 hours."
    location="Gulshan-e-Iqbal, Karachi"
    time="5 min ago"
    likes={12}
    comments={3}
  />

  <DonationCard
    category="food"
    urgent={false}
    title="5 Person Meal Available"
    description="Home-cooked meal available for 5 people including rice, curry, and bread. Prefer same-day pickup."
    location="Model Town, Lahore"
    time="20 min ago"
    likes={20}
    comments={6}
  />

  <DonationCard
    category="clothes"
    urgent={false}
    title="Winter Clothes Available for Children"
    description="Gently used winter jackets, sweaters, and shoes available for children aged 5 to 10."
    location="F-10, Islamabad"
    time="1 hour ago"
    likes={35}
    comments={8}
  />

  <DonationCard
    category="financial"
    urgent={false}
    title="Monthly Grocery Support Available"
    description="Willing to sponsor monthly groceries for a family in need. NGOs or verified individuals preferred."
    location="Saddar, Rawalpindi"
    time="2 hours ago"
    likes={28}
    comments={7}
  />

</ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} />
        <Ionicons name="heart-outline" size={24} />
        <Ionicons name="add-circle-outline" size={30} />
        <Ionicons name="notifications-outline" size={24} />
        <Ionicons name="person-outline" size={24} color="red" />
      </View>
    </View>
  );
}
