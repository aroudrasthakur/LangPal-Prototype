import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Partner } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Avatar from "./Avatar";

type ChatPartner = Partner & {
  lastMessage: {
    text: string;
    timestamp: number;
    language: string;
  };
};

type Props = {
  currentUserId: string;
  colors: any;
  mockPartners: Partner[];
};

export default function ChatList({
  currentUserId,
  colors,
  mockPartners,
}: Props) {
  const [recentChats, setRecentChats] = useState<ChatPartner[]>([]);
  const styles = createStyles(colors);

  useEffect(() => {
    const loadRecentChats = async () => {
      try {
        // Get all chat keys from storage
        const keys = await AsyncStorage.getAllKeys();
        const chatKeys = keys.filter((k) => k.startsWith("chat-"));

        // Load last message from each chat
        const chatsWithMessages = await Promise.all(
          chatKeys.map(async (key) => {
            const messages = JSON.parse(
              (await AsyncStorage.getItem(key)) || "[]"
            );
            const lastMessage = messages[messages.length - 1];
            if (!lastMessage) return null;

            // Extract partner ID from chat key
            const [id1, id2] = key.replace("chat-", "").split("-");
            const partnerId = id1 === currentUserId ? id2 : id1;

            // Find partner in mock data (in real app, fetch from API)
            const partner = mockPartners.find((p) => p.id === partnerId);
            if (!partner) return null;

            return {
              ...partner,
              lastMessage: {
                text: lastMessage.text,
                timestamp: lastMessage.timestamp,
                language: lastMessage.language,
              },
            };
          })
        );

        // Filter out nulls and sort by last message timestamp
        const validChats = chatsWithMessages
          .filter(
            (chat): chat is ChatPartner =>
              chat !== null && chat.lastMessage !== undefined
          )
          .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

        setRecentChats(validChats);
      } catch (e) {
        console.warn("Failed to load recent chats", e);
      }
    };

    loadRecentChats();
  }, [currentUserId, mockPartners]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Chats</Text>
      </View>
      <FlatList
        data={recentChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: { partnerId: item.id },
              })
            }
          >
            <Avatar name={item.name} gender={item.gender} size={50} />
            <View style={styles.chatItemContent}>
              <Text style={styles.chatItemName}>{item.name}</Text>
              {item.lastMessage && (
                <View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage.text}
                  </Text>
                  <Text style={styles.lastMessageInfo}>
                    {new Date(item.lastMessage.timestamp).toLocaleDateString()}{" "}
                    •{item.lastMessage.language}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No conversations yet.{"\n"}
              Find a language partner to start chatting!
            </Text>
            <TouchableOpacity
              style={styles.findPartnersButton}
              onPress={() => router.push("/partners")}
            >
              <Text style={styles.findPartnersButtonText}>Find Partners</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.muted,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
    },
    chatList: {
      padding: 16,
      gap: 12,
    },
    chatItem: {
      flexDirection: "row",
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 12,
      gap: 12,
      alignItems: "center",
    },
    chatItemContent: {
      flex: 1,
    },
    chatItemName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    lastMessage: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: 2,
    },
    lastMessageInfo: {
      fontSize: 12,
      color: colors.muted,
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: "center",
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 16,
      lineHeight: 24,
    },
    findPartnersButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    findPartnersButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });
