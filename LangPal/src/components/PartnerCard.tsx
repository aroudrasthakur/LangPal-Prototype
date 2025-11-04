import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Partner } from "../types";
import Avatar from "./Avatar";

export default function PartnerCard({
  partner,
  onPress,
}: {
  partner: Partner;
  onPress: () => void;
}) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={styles.card}>
        <Avatar name={partner.name} gender={partner.gender} size={56} />
        <View style={styles.info}>
          <Text style={styles.name}>{partner.name}</Text>
          <Text style={styles.langs}>
            {partner.native} • Learning: {partner.learning}
          </Text>
          {partner.gender ? (
            <Text style={styles.gender}>{`Gender: ${partner.gender}`}</Text>
          ) : null}
        </View>
        <View style={styles.statusWrap}>
          <View
            style={[
              styles.statusBadge,
              partner.status === "Online" ? styles.online : styles.recent,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                partner.status === "Recently Active" && isDark
                  ? { color: "#000000" }
                  : null,
              ]}
            >
              {partner.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
    },
    avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
    info: { flex: 1, marginLeft: 16 },
    name: { fontWeight: "800", color: colors.text, fontSize: 16 },
    langs: { color: colors.muted, marginTop: 4, fontSize: 13 },
    gender: { color: colors.muted, marginTop: 6, fontSize: 12 },
    statusWrap: { marginLeft: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 },
    online: { backgroundColor: colors.secondary },
    recent: { backgroundColor: "#F1F5F9" },
    statusText: { fontSize: 12, fontWeight: "700", color: colors.text },
  });
