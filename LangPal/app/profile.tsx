import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import Avatar from "../src/components/Avatar";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const styles = createStyles(theme.colors);

  const onLogout = async () => {
    await logout();
  };

  if (!currentUser) {
    router.replace("/");
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          name={`${currentUser.firstName} ${currentUser.lastName}`}
          gender={currentUser.gender}
          uri={currentUser.avatarUri}
          size={120}
        />
        <Text style={styles.name}>
          {currentUser.firstName} {currentUser.lastName}
        </Text>
        <Text style={styles.username}>@{currentUser.username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.row}>
          <Text style={styles.text}>Gender</Text>
          <Text style={styles.value}>{currentUser.gender}</Text>
        </View>
        {currentUser.pronouns && (
          <View style={styles.row}>
            <Text style={styles.text}>Pronouns</Text>
            <Text style={styles.value}>{currentUser.pronouns}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.text}>Date of Birth</Text>
          <Text style={styles.value}>{currentUser.dob}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.row}>
          <Text style={styles.text}>Native Language</Text>
          <Text style={styles.value}>{currentUser.native}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Learning</Text>
          <Text style={styles.value}>{currentUser.learning}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.row}>
          <Text style={styles.text}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      alignItems: "center",
      padding: 24,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.muted,
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 16,
    },
    username: {
      fontSize: 16,
      color: colors.muted,
      marginTop: 4,
    },
    section: {
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.muted,
    },
    text: {
      fontSize: 16,
      color: colors.text,
    },
    value: {
      fontSize: 16,
      color: colors.muted,
    },
    logoutButton: {
      margin: 16,
      padding: 16,
      backgroundColor: "#ff3b30",
      borderRadius: 8,
      alignItems: "center",
    },
    logoutText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });
