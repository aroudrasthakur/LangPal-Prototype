import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

// Comprehensive language list
const LANGUAGES = [
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Catalan",
  "Cebuano",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Corsican",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Esperanto",
  "Estonian",
  "Filipino",
  "Finnish",
  "French",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Haitian Creole",
  "Hausa",
  "Hawaiian",
  "Hebrew",
  "Hindi",
  "Hmong",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kazakh",
  "Khmer",
  "Kinyarwanda",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latin",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Maori",
  "Marathi",
  "Mongolian",
  "Myanmar (Burmese)",
  "Nepali",
  "Norwegian",
  "Nyanja",
  "Odia",
  "Pashto",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Samoan",
  "Scots Gaelic",
  "Serbian",
  "Sesotho",
  "Shona",
  "Sindhi",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Swedish",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Turkish",
  "Turkmen",
  "Ukrainian",
  "Urdu",
  "Uyghur",
  "Uzbek",
  "Vietnamese",
  "Welsh",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zulu",
].sort();

export default function LoginScreen() {
  const auth = useAuth();
  const { theme, isDark } = useTheme();
  const [isSignup, setIsSignup] = useState(false);

  // signup steps
  const [step, setStep] = useState(1);

  // login fields
  const [username, setUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup password
  const [signupPassword, setSignupPassword] = useState("");

  // signup extra fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dob, setDob] = useState("");
  const [nativeLang, setNativeLang] = useState("");
  const [learning, setLearning] = useState("");
  const [gender, setGender] = useState<
    "male" | "female" | "non-binary" | "other" | string
  >("");
  const [pronouns, setPronouns] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [usernameError, setUsernameError] = useState("");
  const [dobError, setDobError] = useState("");

  // Language picker modal state
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [languagePickerMode, setLanguagePickerMode] = useState<
    "native" | "learning"
  >("native");
  const [languageSearch, setLanguageSearch] = useState("");

  // Determine input text color based on theme (black for light, white for dark)
  const inputTextColor = isDark ? "#FFFFFF" : "#000000";

  // Validate DOB format (MM/DD/YYYY)
  const validateDOB = (dob: string): boolean => {
    const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dobRegex.test(dob)) return false;

    // Additional check: ensure valid date
    const [month, day, year] = dob.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day;
  };

  const openLanguagePicker = (mode: "native" | "learning") => {
    setLanguagePickerMode(mode);
    setLanguageSearch("");
    setShowLanguagePicker(true);
  };

  const selectLanguage = (lang: string) => {
    if (languagePickerMode === "native") {
      setNativeLang(lang);
    } else {
      setLearning(lang);
    }
    setShowLanguagePicker(false);
  };

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  // Memoize styles to prevent recreation on every render
  const styles = React.useMemo(
    () => createStyles(theme.colors),
    [theme.colors]
  );

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!res.canceled) setAvatarUri(res.assets[0]?.uri);
    } catch (e) {
      console.warn("image pick failed", e);
    }
  };

  const takePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });
      if (!res.canceled) setAvatarUri(res.assets[0]?.uri);
    } catch (e) {
      console.warn("camera failed", e);
    }
  };

  const onLogin = async () => {
    const r = await auth.login(username, loginPassword);
    if (!r.ok) Alert.alert("Login failed", r.error || "");
  };

  const onSignup = async () => {
    const id = Date.now().toString();
    const user = {
      id,
      firstName,
      lastName,
      username,
      password: signupPassword,
      dob,
      native: nativeLang,
      learning,
      gender,
      pronouns,
      avatarUri,
    };
    const r = await auth.signUp(user as any);
    if (!r.ok) {
      Alert.alert("Signup failed", r.error || "");
      console.warn("Signup failed", r.error);
      return;
    }

    // clear sensitive fields
    setSignupPassword("");
    setConfirm("");

    try {
      router.replace("/");
    } catch (e) {
      console.warn("router.replace failed after signup", e);
    }
  };

  const renderSignupStep1 = () => (
    <>
      <Text style={styles.label}>Choose a username</Text>
      <TextInput
        key="username-input"
        style={[
          styles.input,
          { color: inputTextColor },
          usernameError ? { borderColor: "#ff3b30" } : null,
        ]}
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setUsernameError("");
        }}
        placeholder="Username"
        placeholderTextColor={inputTextColor}
        autoCapitalize="none"
        autoComplete="username-new"
        autoCorrect={false}
        textContentType="username"
      />
      {usernameError ? (
        <Text style={styles.errorText}>{usernameError}</Text>
      ) : null}

      <Text style={styles.label}>Create a password</Text>
      <TextInput
        key="signup-password-input"
        style={[styles.input, { color: inputTextColor }]}
        value={signupPassword}
        onChangeText={setSignupPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={inputTextColor}
        textContentType="newPassword"
        autoComplete="password-new"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Confirm password</Text>
      <TextInput
        key="confirm-password-input"
        style={[styles.input, { color: inputTextColor }]}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Confirm password"
        placeholderTextColor={inputTextColor}
        textContentType="newPassword"
        autoComplete="password-new"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!username || !signupPassword) {
            Alert.alert("Required", "Please fill in all fields");
            return;
          }
          if (signupPassword !== confirm) {
            Alert.alert("Error", "Passwords don't match");
            return;
          }
          if (!auth.usernameAvailable(username)) {
            setUsernameError("Username already taken");
            return;
          }
          setStep(2);
        }}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </>
  );

  const renderSignupStep2 = () => (
    <>
      <Text style={styles.label}>Tell us about yourself</Text>
      <TextInput
        key="first-name-input"
        style={[styles.input, { color: inputTextColor }]}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
        placeholderTextColor={inputTextColor}
        autoComplete="given-name"
        textContentType="givenName"
      />
      <TextInput
        key="last-name-input"
        style={[styles.input, { color: inputTextColor }]}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last name"
        placeholderTextColor={inputTextColor}
        autoComplete="family-name"
        textContentType="familyName"
      />
      <TextInput
        key="dob-input"
        style={[
          styles.input,
          { color: inputTextColor },
          dobError ? { borderColor: "#ff3b30" } : null,
        ]}
        value={dob}
        onChangeText={(text) => {
          setDob(text);
          setDobError("");
        }}
        placeholder="Date of birth (MM/DD/YYYY)"
        placeholderTextColor={inputTextColor}
        autoComplete="birthdate-full"
        textContentType="none"
      />
      {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}

      <TouchableOpacity
        style={[styles.input, styles.pickerInput]}
        onPress={() => openLanguagePicker("native")}
      >
        <Text
          style={[
            nativeLang ? styles.pickerText : styles.pickerPlaceholder,
            { color: inputTextColor },
          ]}
        >
          {nativeLang || "Language you speak"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.input, styles.pickerInput]}
        onPress={() => openLanguagePicker("learning")}
      >
        <Text
          style={[
            learning ? styles.pickerText : styles.pickerPlaceholder,
            { color: inputTextColor },
          ]}
        >
          {learning || "Language you want to learn"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!firstName || !lastName || !dob || !nativeLang || !learning) {
            Alert.alert("Required", "Please fill in all fields");
            return;
          }
          if (!validateDOB(dob)) {
            setDobError("Please enter a valid date in MM/DD/YYYY format");
            return;
          }
          setStep(3);
        }}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setStep(1)}
      >
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </>
  );

  const renderSignupStep3 = () => (
    <>
      <Text style={styles.label}>Your identity</Text>
      <View style={styles.radioGroup}>
        {["male", "female", "non-binary", "other"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.radioButton,
              gender === g && styles.radioButtonSelected,
            ]}
            onPress={() => setGender(g)}
          >
            <Text style={styles.radioButtonText}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        key="pronouns-input"
        style={[styles.input, { color: inputTextColor }]}
        value={pronouns}
        onChangeText={setPronouns}
        placeholder="Pronouns (they/them)"
        placeholderTextColor={inputTextColor}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!gender) {
            Alert.alert("Required", "Please select your gender");
            return;
          }
          setStep(4);
        }}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </>
  );

  const renderSignupStep4 = () => (
    <>
      <Text style={styles.label}>Choose your avatar</Text>
      <View style={styles.avatarPreview}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>?</Text>
          </View>
        )}
      </View>
      <View style={styles.avatarButtons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonHalf]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonHalf]}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          await onSignup();
        }}
      >
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setStep(3)}
      >
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        enabled={true}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="none"
        >
          <View style={styles.card}>
            <Image
              source={require("../../assets/langpal-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {isSignup ? "Create Account" : "Welcome Back"}
            </Text>

            {!isSignup ? (
              <View key="login">
                <TextInput
                  style={[styles.input, { color: inputTextColor }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor={inputTextColor}
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect={false}
                  textContentType="username"
                />
                <TextInput
                  style={[styles.input, { color: inputTextColor }]}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor={inputTextColor}
                  autoComplete="current-password"
                  textContentType="password"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={onLogin}>
                  <Text style={styles.buttonText}>Log in</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View key={`signup-${step}`}>
                {step === 1 && renderSignupStep1()}
                {step === 2 && renderSignupStep2()}
                {step === 3 && renderSignupStep3()}
                {step === 4 && renderSignupStep4()}
              </View>
            )}

            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.button, styles.linkButton]}
              onPress={() => {
                setIsSignup((s) => !s);
                setStep(1);
                setSignupPassword("");
                setLoginPassword("");
                setConfirm("");
                setUsernameError("");
              }}
            >
              <Text style={styles.linkButtonText}>
                {isSignup
                  ? "Already have an account? Log in"
                  : "Create a new account"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {languagePickerMode === "native"
                  ? "Select Your Native Language"
                  : "Select Language to Learn"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowLanguagePicker(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, { color: inputTextColor }]}
              value={languageSearch}
              onChangeText={setLanguageSearch}
              placeholder="Search languages..."
              placeholderTextColor={inputTextColor}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => item}
              style={styles.languageList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.languageItem}
                  onPress={() => selectLanguage(item)}
                >
                  <Text style={styles.languageItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.emptyListText}>No languages found</Text>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.background,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      padding: 24,
      borderRadius: 16,
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 24,
      alignSelf: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 24,
      textAlign: "center",
      color: colors.text,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.muted,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      fontSize: 16,
      backgroundColor: colors.background,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      marginBottom: 12,
    },
    buttonText: {
      color: "white",
      fontWeight: "600",
      textAlign: "center",
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontWeight: "600",
      textAlign: "center",
      fontSize: 16,
    },
    linkButton: {
      backgroundColor: "transparent",
      marginTop: 8,
    },
    linkButtonText: {
      color: colors.primary,
      fontWeight: "500",
      textAlign: "center",
      fontSize: 15,
    },
    divider: {
      height: 1,
      backgroundColor: colors.muted,
      marginVertical: 24,
    },
    radioGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    radioButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.muted,
      backgroundColor: colors.background,
    },
    radioButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    radioButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
    },
    avatarPreview: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.background,
      alignSelf: "center",
      marginBottom: 16,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarPlaceholderText: {
      fontSize: 32,
      color: colors.muted,
    },
    avatarButtons: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    buttonHalf: {
      flex: 1,
    },
    errorText: {
      color: "#ff3b30",
      fontSize: 12,
      marginTop: -8,
      marginBottom: 8,
      marginLeft: 4,
    },
    pickerInput: {
      justifyContent: "center",
    },
    pickerText: {
      color: colors.text,
      fontSize: 16,
    },
    pickerPlaceholder: {
      color: colors.muted,
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "80%",
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.muted,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalCloseText: {
      fontSize: 24,
      color: colors.text,
      fontWeight: "300",
    },
    searchInput: {
      margin: 16,
      padding: 12,
      borderWidth: 1.5,
      borderColor: colors.muted,
      borderRadius: 8,
      fontSize: 16,
      backgroundColor: colors.background,
      color: colors.text,
    },
    languageList: {
      paddingHorizontal: 16,
    },
    languageItem: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.muted,
    },
    languageItemText: {
      fontSize: 16,
      color: colors.text,
    },
    emptyListText: {
      textAlign: "center",
      color: colors.muted,
      fontSize: 16,
      marginTop: 32,
    },
  });
