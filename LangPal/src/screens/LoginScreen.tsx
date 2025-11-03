import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function LoginScreen() {
  const auth = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  // signup steps
  const [step, setStep] = useState(1);

  // login fields
  const [username, setUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup password
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => {
    if (signupPassword) {
      console.warn("signupPassword changed length=", signupPassword.length);
    }
  }, [signupPassword]);

  useEffect(() => {
    if (loginPassword) {
      console.warn("loginPassword changed length=", loginPassword.length);
    }
  }, [loginPassword]);

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

  const SignupStep1 = () => (
    <>
      <Text style={styles.label}>Choose a username</Text>
      <TextInput
        style={[
          styles.input,
          usernameError ? { borderColor: "#ff3b30" } : null,
        ]}
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setUsernameError("");
        }}
        placeholder="Username"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        textContentType="none"
        importantForAutofill="no"
      />
      {usernameError ? (
        <Text style={styles.errorText}>{usernameError}</Text>
      ) : null}

      <Text style={styles.label}>Create a password</Text>
      <TextInput
        style={styles.input}
        value={signupPassword}
        onChangeText={setSignupPassword}
        secureTextEntry
        placeholder="Password"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
        autoCapitalize="none"
        blurOnSubmit={false}
        passwordRules=""
      />

      <Text style={styles.label}>Confirm password</Text>
      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Confirm password"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
        autoCapitalize="none"
        blurOnSubmit={false}
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

  const SignupStep2 = () => (
    <>
      <Text style={styles.label}>Tell us about yourself</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
      />
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last name"
      />
      <TextInput
        style={styles.input}
        value={dob}
        onChangeText={setDob}
        placeholder="Date of birth (YYYY-MM-DD)"
      />
      <TextInput
        style={styles.input}
        value={nativeLang}
        onChangeText={setNativeLang}
        placeholder="Language you speak"
      />
      <TextInput
        style={styles.input}
        value={learning}
        onChangeText={setLearning}
        placeholder="Language you want to learn"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!firstName || !lastName || !dob || !nativeLang || !learning) {
            Alert.alert("Required", "Please fill in all fields");
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

  const SignupStep3 = () => (
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
        style={styles.input}
        value={pronouns}
        onChangeText={setPronouns}
        placeholder="Pronouns (they/them)"
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

  const SignupStep4 = () => (
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
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                textContentType="none"
                importantForAutofill="no"
                blurOnSubmit={false}
              />
              <TextInput
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                placeholder="Password"
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                autoCapitalize="none"
                blurOnSubmit={false}
              />
              <TouchableOpacity style={styles.button} onPress={onLogin}>
                <Text style={styles.buttonText}>Log in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View key={`signup-${step}`}>
              {step === 1 && <SignupStep1 />}
              {step === 2 && <SignupStep2 />}
              {step === 3 && <SignupStep3 />}
              {step === 4 && <SignupStep4 />}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "white",
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
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  button: {
    backgroundColor: "#007AFF",
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
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  linkButton: {
    backgroundColor: "transparent",
    marginTop: 8,
  },
  linkButtonText: {
    color: "#007AFF",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
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
    borderColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  radioButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  radioButtonText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "500",
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
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
    color: "#999",
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
});
