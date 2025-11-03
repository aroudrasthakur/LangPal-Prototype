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
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
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
      height: 40,
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
      backgroundColor: colors.primary,
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
    cardTitle: {
      fontSize: 16,
      color: colors.muted,
    },
    cardValue: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
  });
