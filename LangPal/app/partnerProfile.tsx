import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import Avatar from "../src/components/Avatar";
import { useLocalSearchParams, useRouter } from "expo-router";
// reuse Partner type from src/types if available
import { Partner } from "../src/types";

// Mock partners same source as partners.tsx
const MOCK_PARTNERS: Partner[] = [
  {
    id: "1",
    name: "María",
    native: "Spanish",
    learning: "English",
    status: "Online",
    bio: "Loves coffee and short daily chats.",
    gender: "female" as const,
    pronouns: "she/her",
  },
  {
    id: "2",
    name: "Kenji",
    native: "Japanese",
    learning: "Spanish",
    status: "Recently Active",
    bio: "Learns Spanish for travel. Likes music.",
    gender: "male" as const,
    pronouns: "he/him",
  },
  {
    id: "3",
    name: "Amina",
    native: "Arabic",
    learning: "French",
    status: "Online",
    bio: "Teacher, available on weekends.",
    gender: "female" as const,
    pronouns: "she/her",
  },
  {
    id: "4",
    name: "Luca",
    native: "Italian",
    learning: "English",
    status: "Recently Active",
    bio: "Foodie and cyclist.",
    gender: "non-binary" as const,
    pronouns: "they/them",
  },
  {
    id: "5",
    name: "Sofia",
    native: "Portuguese",
    learning: "German",
    status: "Online",
    bio: "Student, weekday evenings.",
    gender: "female" as const,
    pronouns: "she/her",
  },
];

export default function PartnerProfile() {
  const { theme } = useTheme();
  const { currentUser, users } = useAuth();
  const params = useLocalSearchParams();
  const router = useRouter();
  const styles = createStyles(theme.colors);
  const [partner, setPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const id = params.partnerId as string | undefined;
    if (!id) return;

    // find in MOCK then in users
    const fromMock = MOCK_PARTNERS.find((p) => p.id === id);
    if (fromMock) {
      setPartner(fromMock);
      return;
    }

    const fromUsers = users.find((u: any) => u.id === id);
    if (fromUsers) {
      setPartner({
        id: fromUsers.id,
        name: fromUsers.firstName
          ? `${fromUsers.firstName} ${fromUsers.lastName || ""}`.trim()
          : fromUsers.username,
        native: fromUsers.native || "",
        learning: fromUsers.learning || "",
        status: "Online",
        bio: (fromUsers as any).bio || "",
        gender: fromUsers.gender,
      } as Partner);
    }
  }, [params.partnerId, users]);

  const determineLanguage = (cu: any, p: Partner | null) => {
    if (!p || !cu) return p?.native || "en";
    const cuLearning = (cu.learning || "").toLowerCase();
    const pNative = (p.native || "").toLowerCase();
    const pLearning = (p.learning || "").toLowerCase();
    const cuNative = (cu.native || "").toLowerCase();

    if (cuLearning && pNative && cuLearning === pNative) return cu.learning;
    if (pLearning && cuNative && pLearning === cuNative) return p.learning;
    if (cu.learning) return cu.learning;
    return p.native || "en";
  };

  if (!partner) return null;

  const startChat = () => {
    if (!currentUser) return;
    const lang = determineLanguage(currentUser, partner);
    router.push(
      `/chat?partnerId=${partner.id}&language=${encodeURIComponent(lang)}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.top}>
        <Avatar name={partner.name} gender={partner.gender} size={96} />
        <Text style={styles.name}>{partner.name}</Text>
        <Text style={styles.subtitle}>{partner.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Languages</Text>
        <Text style={styles.sectionText}>Native: {partner.native || "—"}</Text>
        <Text style={styles.sectionText}>
          Learning: {partner.learning || "—"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionText}>
          {partner.bio || "No bio provided."}
        </Text>
      </View>

      <TouchableOpacity style={styles.chatButton} onPress={startChat}>
        <Text style={styles.chatButtonText}>Chat with {partner.name}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24 },
    top: { alignItems: "center", marginBottom: 16 },
    name: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginTop: 12,
    },
    subtitle: { color: colors.muted, marginTop: 6 },
    section: { marginTop: 16 },
    sectionTitle: { fontWeight: "700", color: colors.text, marginBottom: 6 },
    sectionText: { color: colors.text },
    chatButton: {
      marginTop: 24,
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    chatButtonText: { color: "white", fontWeight: "700" },
  });
