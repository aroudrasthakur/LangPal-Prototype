import { Tabs, useRouter, usePathname } from "expo-router";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme, ThemeProvider } from "../src/context/ThemeContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import LoginScreen from "../src/screens/LoginScreen";
import Avatar from "../src/components/Avatar";

function AuthGate() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <LoginScreen />;
  return <TabsLayout />;
}

function TabsLayout() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  // pathname returns the current path including query on web, on native it may be like '/chat'
  // We detect a conversation view when pathname contains 'chat' and there is a partnerId query param
  const isConversationView =
    pathname.includes("chat?partnerId=") || pathname.includes("/chat/");

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTintColor: theme.colors.text,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.muted,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
          }}
        />
        <Tabs.Screen
          name="partners"
          options={{
            title: "Partner",
            tabBarIcon: ({ color }) => <Text style={{ color }}>👥</Text>,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: () => (
              <Avatar
                name={
                  currentUser?.firstName
                    ? `${currentUser.firstName} ${currentUser.lastName || ""}`
                    : ""
                }
                gender={currentUser?.gender}
                uri={currentUser?.avatarUri}
                size={28}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="partnerProfile"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {!isConversationView && (
        <TouchableOpacity
          style={[styles.chatButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push("/chat")}
        >
          <Text style={styles.chatIcon}>💬</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatButton: {
    position: "absolute",
    right: 16,
    bottom: 100, // Increased distance from tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  chatIcon: {
    fontSize: 24,
    color: "white",
  },
});
