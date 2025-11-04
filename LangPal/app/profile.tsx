import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import Avatar from "../src/components/Avatar";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { currentUser, logout, deleteAccount } = useAuth();
  const styles = createStyles(theme.colors);

  const onLogout = async () => {
    await logout();
  };

  const onDeleteAccount = async () => {
    // Confirm destructive action
    const confirmed = await new Promise<boolean>((resolve) => {
      // Use the native alert for confirm; fall back to resolve(false) if unsupported
      Alert.alert(
        "Delete your account?",
        "This will remove your credentials and delete your chats. You will also be removed as a partner from other users.",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]
      );
    });
    if (!confirmed) return;
    await deleteAccount();
  };

  React.useEffect(() => {
    if (!currentUser) {
      router.replace("/");
    }
  }, [currentUser]);

  if (!currentUser) {
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
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/editProfile")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
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

      <TouchableOpacity style={styles.deleteButton} onPress={onDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
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
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    text: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    value: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "600",
    },
    logoutButton: {
      margin: 16,
      padding: 16,
      backgroundColor: "#fff",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#ff3b30",
      borderRadius: 8,
      alignItems: "center",
    },
    logoutText: {
      color: "#ff3b30",
      fontSize: 16,
      fontWeight: "700",
    },
    editButton: {
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    editText: {
      color: "#fff",
      fontWeight: "700",
    },
    deleteButton: {
      marginHorizontal: 16,
      marginBottom: 24,
      padding: 14,
      backgroundColor: "#B00020",
      borderRadius: 8,
      alignItems: "center",
    },
    deleteText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });
