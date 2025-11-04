import {
  Tabs,
  useRouter,
  usePathname,
  useGlobalSearchParams,
} from "expo-router";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  AccessibilityInfo,
} from "react-native";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import LoginScreen from "../src/screens/LoginScreen";
import Avatar from "../src/components/Avatar";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import WaveOverlay, {
  WaveOverlayStartRect,
} from "../src/components/WaveOverlay";

function AuthGate() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <LoginScreen />;
  return <TabsLayout />;
}

function TabsLayout() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  const { partnerId } = useGlobalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  // pathname returns the current path including query on web, on native it may be like '/chat'
  // We detect a conversation view when pathname contains 'chat' and there is a partnerId query param
  const isChatScreen = pathname.startsWith("/chat");
  const isConversationView = isChatScreen && !!partnerId;

  // Draggable chat button setup
  const pan = useRef(new Animated.ValueXY({ x: 0, y: -110 })).current;
  const isDragging = useRef(false);
  const chatButtonRef = useRef<View | null>(null);
  const [isWaveAnimating, setIsWaveAnimating] = useState(false);
  const [startRect, setStartRect] = useState<WaveOverlayStartRect | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReducedMotion)
      .catch(() => setReducedMotion(false));
  }, []);

  const measureChatButton = (): Promise<WaveOverlayStartRect | null> =>
    new Promise((resolve) => {
      if (!chatButtonRef.current) return resolve(null);
      // measureInWindow gives absolute position
      // @ts-ignore measureInWindow exists on native components
      chatButtonRef.current.measureInWindow(
        (x: number, y: number, w: number, h: number) => {
          resolve({ x, y, width: w, height: h });
        }
      );
    });

  const handleChatPress = async () => {
    if (isWaveAnimating) return;
    try {
      await Haptics.selectionAsync();
    } catch {}

    if (reducedMotion) {
      router.push("/chat");
      return;
    }
    const rect = await measureChatButton();
    if (!rect) {
      router.push("/chat");
      return;
    }
    setStartRect(rect);
    setIsWaveAnimating(true);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          // @ts-ignore - _value is internal but needed for offset
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        if (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5) {
          isDragging.current = true;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(_, gesture);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        if (!isDragging.current) {
          handleChatPress();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: isDark ? theme.colors.card : "#2F855A",
          },
          headerTintColor: isDark ? theme.colors.text : "#FFFFFF",
          tabBarStyle: isConversationView
            ? { display: "none" }
            : {
                // Full-width band at the very bottom with safe area
                height: 50 + insets.bottom,
                backgroundColor: isDark ? theme.colors.card : "#2F855A",
                borderTopWidth: 0,
                paddingBottom: insets.bottom,
              },
          tabBarActiveTintColor: "#E53935", // red accent
          tabBarInactiveTintColor: "#E6F4EA",
          tabBarShowLabel: false,
          tabBarItemStyle: {
            height: 70,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarButton: (props) => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={async (e) => {
                  try {
                    await Haptics.selectionAsync();
                  } catch {}
                  // @ts-ignore event type mismatch is acceptable here
                  props.onPress?.(e);
                }}
                style={({ pressed }) => [
                  { flex: 1, justifyContent: "center", alignItems: "center" },
                  pressed && { opacity: 0.8 },
                ]}
              >
                {props.children}
              </Pressable>
            </View>
          ),
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => {
              const isActive = !!focused;
              const activeColor = isDark ? "#FF8C00" : "#FFD700"; // orange in dark, yellow in light
              const iconName = isActive ? "home" : "home-outline";
              return (
                <View
                  style={[
                    styles.iconContainer,
                    isActive &&
                      (isDark
                        ? styles.activeIconContainerDark
                        : styles.activeIconContainerLight),
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={26}
                    color={isActive ? activeColor : color}
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="partners"
          options={{
            title: "Partner",
            tabBarIcon: ({ color, focused }) => {
              const isActive = !!focused;
              const activeColor = isDark ? "#FF8C00" : "#FFD700"; // orange in dark, yellow in light
              const iconName = isActive ? "people" : "people-outline";
              return (
                <View
                  style={[
                    styles.iconContainer,
                    isActive &&
                      (isDark
                        ? styles.activeIconContainerDark
                        : styles.activeIconContainerLight),
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={26}
                    color={isActive ? activeColor : color}
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused &&
                    (isDark
                      ? styles.activeIconContainerDark
                      : styles.activeIconContainerLight),
                ]}
              >
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
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="partnerProfile"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="editProfile"
          options={{
            href: null,
            title: "Edit Profile",
          }}
        />
      </Tabs>

      {!isChatScreen && (
        <Animated.View
          ref={chatButtonRef as any}
          style={[
            styles.chatButton,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Pressable
            onPress={handleChatPress}
            style={{ padding: 8 }}
            android_ripple={{
              color: "rgba(255,255,255,0.2)",
              borderless: true,
            }}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      )}

      {isWaveAnimating && startRect && (
        <WaveOverlay
          startRect={startRect}
          color="#FF8C00"
          durationMs={550}
          reducedMotion={reducedMotion}
          onCovered={() => {
            // When fully covered, open chat immediately
            router.push("/chat");
          }}
          onDone={() => {
            setIsWaveAnimating(false);
            setStartRect(null);
          }}
        />
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
    backgroundColor: "#0F2942",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconContainerLight: {
    // Yellow highlight for active tab in light mode
    backgroundColor: "rgba(255, 215, 0, 0.25)", // gold, semi-transparent
  },
  activeIconContainerDark: {
    // Keep subtle tint in dark mode
    backgroundColor: "rgba(255, 140, 0, 0.15)",
  },
  chatButton: {
    position: "absolute",
    right: 16,
    bottom: 110,
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
    backgroundColor: "#FF8C00",
  },
});
