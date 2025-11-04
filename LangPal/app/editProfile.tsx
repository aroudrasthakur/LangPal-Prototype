import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Avatar from "../src/components/Avatar";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { currentUser, updateCurrentUser } = useAuth();
  const styles = createStyles(theme.colors);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [pronouns, setPronouns] = useState<string | undefined>(undefined);
  const [dob, setDob] = useState<string | undefined>(undefined);
  const [nativeLang, setNativeLang] = useState<string | undefined>(undefined);
  const [learning, setLearning] = useState<string | undefined>(undefined);
  const [avatarUri, setAvatarUri] = useState<string | null | undefined>(
    undefined
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/");
      return;
    }
    setFirstName(currentUser.firstName || "");
    setLastName(currentUser.lastName || "");
    setGender(currentUser.gender);
    setPronouns(currentUser.pronouns);
    setDob(currentUser.dob);
    setNativeLang(currentUser.native);
    setLearning(currentUser.learning);
    setAvatarUri(currentUser.avatarUri);
  }, [currentUser]);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photos to change your avatar."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  if (!currentUser) {
    return null;
  }

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateCurrentUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: (gender as any) || undefined,
        pronouns: pronouns?.trim() || undefined,
        dob: dob?.trim() || undefined,
        native: nativeLang?.trim() || undefined,
        learning: learning?.trim() || undefined,
        avatarUri: avatarUri,
      });
      // Use a safe fallback destination to avoid back navigation when there's no history
      router.replace("/profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar
            name={`${firstName} ${lastName}`}
            gender={gender}
            uri={avatarUri}
            size={100}
          />
          <View style={styles.avatarButtonsRow}>
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={20} color={theme.colors.primary} />
              <Text style={styles.changeAvatarText}>Change Avatar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetAvatarButton}
              onPress={() => setAvatarUri(null)}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.muted} />
              <Text style={styles.resetAvatarText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            placeholder="First name"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            value={gender || ""}
            onChangeText={setGender}
            style={styles.input}
            placeholder="male / female / non-binary"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Pronouns</Text>
          <TextInput
            value={pronouns || ""}
            onChangeText={setPronouns}
            style={styles.input}
            placeholder="she/her, he/him, they/them"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            value={dob || ""}
            onChangeText={setDob}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Native Language</Text>
          <TextInput
            value={nativeLang || ""}
            onChangeText={setNativeLang}
            style={styles.input}
            placeholder="e.g. English"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Learning</Text>
          <TextInput
            value={learning || ""}
            onChangeText={setLearning}
            style={styles.input}
            placeholder="e.g. Spanish"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={{ height: 16 }} />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.replace("/profile")}
          disabled={saving}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16 },
    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
      paddingVertical: 16,
    },
    avatarButtonsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
    },
    changeAvatarButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderRadius: 20,
      gap: 6,
    },
    changeAvatarText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "600",
    },
    resetAvatarButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderRadius: 20,
      gap: 6,
    },
    resetAvatarText: {
      color: colors.muted,
      fontSize: 15,
      fontWeight: "600",
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    fieldRow: { marginBottom: 16 },
    label: {
      color: colors.text,
      marginBottom: 8,
      fontSize: 15,
      fontWeight: "500",
    },
    input: {
      backgroundColor: colors.card,
      color: colors.text,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 16,
      fontWeight: "500",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    saveText: { color: "#fff", fontWeight: "700" },
    cancelButton: {
      marginTop: 10,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: "transparent",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.muted,
    },
    cancelText: { color: colors.text, fontWeight: "600" },
  });
