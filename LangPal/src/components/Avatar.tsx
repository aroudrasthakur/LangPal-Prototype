import React from "react";
import { View, Text, Image, Platform, StyleSheet } from "react-native";

type Props = {
  name?: string;
  gender?: string | null;
  size?: number;
  uri?: any;
};

export default function Avatar({ name, gender, size = 56, uri }: Props) {
  // Use react-avatar on web for nicer avatars
  if (Platform.OS === "web") {
    try {
      // require dynamically so native bundlers don't try to resolve it
      const maybe = (require as any)("react-avatar");
      const ReactAvatar = maybe && maybe.default ? maybe.default : maybe;
      if (ReactAvatar) {
        // @ts-ignore - react-avatar types aren't guaranteed here
        return <ReactAvatar name={name || ""} size={size} round={true} />;
      }
    } catch {
      // fall through to native rendering if react-avatar isn't available
    }
  }

  // Native fallback: use provided uri if available, else render initials
  if (uri) {
    return (
      <Image
        source={uri}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  const initials =
    (name || "")
      .split(" ")
      .map((s) => (s ? s[0] : ""))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const bgColor = (() => {
    if (!gender) return "#E6EEF3";
    const g = gender.toLowerCase();
    if (g === "male") return "#CFE8FF";
    if (g === "female") return "#FFE0EE";
    if (g === "non-binary") return "#E8D7FF";
    return "#E6EEF3";
  })();

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: Math.round(size / 2.4) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    resizeMode: "cover",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6EEF3",
  },
  initials: {
    color: "#0f1720",
    fontWeight: "700",
  },
});
