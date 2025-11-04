import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme.colors);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Image
            source={require("../assets/langpal-logo.png")}
            style={styles.logo}
          />
          <Text style={styles.logoText}>LangPal</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heading}>
            Practice languages with friendly partners
          </Text>
          <Text style={styles.subheading}>
            Match with native speakers, exchange short daily conversations, and
            build confidence.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/partners")}
          >
            <Text style={styles.primaryButtonText}>Find a Partner</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardTitle}>🔥 Current streak</Text>
                <Text style={styles.cardValue}>5 days in a row</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities & Challenges</Text>
          {ACTIVITIES.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.activityCard}
              onPress={() => router.push("/partners")}
            >
              <View style={styles.activityLeft}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activityDesc}>{a.description}</Text>
              </View>
              <View style={styles.activityMeta}>
                <Text style={styles.activityChip}>{a.duration}m</Text>
                <Text style={styles.activityType}>{a.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ACTIVITIES = [
  {
    id: "1",
    title: "Daily Conversation",
    description: "Chat about your day with a partner.",
    duration: 5,
    type: "Speaking",
  },
  {
    id: "2",
    title: "Listening Sprint",
    description: "Short clip + questions.",
    duration: 4,
    type: "Listening",
  },
  {
    id: "3",
    title: "Vocab Quiz",
    description: "10 quick words you should know.",
    duration: 3,
    type: "Vocabulary",
  },
  {
    id: "4",
    title: "Pronunciation Drill",
    description: "Repeat after native phrases.",
    duration: 6,
    type: "Speaking",
  },
  {
    id: "5",
    title: "Grammar Mini-lesson",
    description: "One rule, three examples.",
    duration: 5,
    type: "Grammar",
  },
];

const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      // Use theme background so dark mode applies
      backgroundColor: colors.background,
    },
    container: {
      padding: 16,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 32,
    },
    logo: {
      width: 40,
      height: 50,
      marginRight: 12,
    },
    logoText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    hero: {
      gap: 24,
    },
    heading: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
    },
    subheading: {
      fontSize: 18,
      color: colors.muted,
      lineHeight: 26,
    },
    primaryButton: {
      backgroundColor: colors.primary, // green
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
    },
    card: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardTitle: { fontSize: 16, color: colors.muted },
    cardValue: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    section: {
      marginTop: 24,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    activityCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    activityLeft: { flex: 1, paddingRight: 12 },
    activityTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
    activityDesc: { fontSize: 14, color: colors.muted, marginTop: 4 },
    activityMeta: { alignItems: "flex-end", gap: 6 },
    activityChip: {
      backgroundColor: colors.primary,
      color: "#fff",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      overflow: "hidden",
      fontWeight: "700",
    },
    activityType: { fontSize: 12, color: colors.muted },
  });
