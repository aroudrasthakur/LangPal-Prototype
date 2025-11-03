import React from "react";
import { SafeAreaView, FlatList, StyleSheet } from "react-native";
import PartnerCard from "../src/components/PartnerCard";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import { useRouter, useLocalSearchParams } from "expo-router";

// Mock partner data
const MOCK_PARTNERS = [
  {
    id: "1",
    name: "María",
    native: "Spanish",
    learning: "English",
    status: "Online",
    bio: "Loves coffee and short daily chats.",
    gender: "female",
    pronouns: "she/her",
  },
  {
    id: "2",
    name: "Kenji",
    native: "Japanese",
    learning: "Spanish",
    status: "Recently Active",
    bio: "Learns Spanish for travel. Likes music.",
    gender: "male",
    pronouns: "he/him",
  },
  {
    id: "3",
    name: "Amina",
    native: "Arabic",
    learning: "French",
    status: "Online",
    bio: "Teacher, available on weekends.",
    gender: "female",
    pronouns: "she/her",
  },
  {
    id: "4",
    name: "Luca",
    native: "Italian",
    learning: "English",
    status: "Recently Active",
    bio: "Foodie and cyclist.",
    gender: "non-binary",
    pronouns: "they/them",
  },
  {
    id: "5",
    name: "Sofia",
    native: "Portuguese",
    learning: "German",
    status: "Online",
    bio: "Student, weekday evenings.",
    gender: "female",
    pronouns: "she/her",
  },
];

export default function PartnersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const styles = createStyles(theme.colors);
  const { users } = useAuth();

  const renderPartner = ({ item }: any) => (
    <PartnerCard
      partner={item}
      onPress={() => {
        // Open partner profile first, with option to chat
        router.push(`/partnerProfile?partnerId=${item.id}`);
      }}
    />
  );

  const combined = [
    ...MOCK_PARTNERS,
    ...users.map((u) => ({
      id: u.id,
      name: u.firstName
        ? `${u.firstName} ${u.lastName || ""}`.trim()
        : u.username,
      native: u.native || "",
      learning: u.learning || "",
      status: "Online",
      bio: "",
      gender: u.gender,
    })),
  ];

  // If the current route has a focused partnerId, exclude that partner from the list
  const focusedId = (params as any).partnerId as string | undefined;
  const visiblePartners = focusedId
    ? combined.filter((p) => p.id !== focusedId)
    : combined;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={visiblePartners}
        renderItem={renderPartner}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      padding: 16,
      gap: 16,
    },
  });
