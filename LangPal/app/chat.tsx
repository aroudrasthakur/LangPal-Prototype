import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import Avatar from "../src/components/Avatar";
import { router, useLocalSearchParams } from "expo-router";
import { Message, Partner } from "../src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import mock data (in a real app, this would be from an API)
const MOCK_PARTNERS: Partner[] = [
  {
    id: "1",
    name: "María",
    native: "Spanish",
    learning: "English",
    status: "Online",
    bio: "Loves coffee and short daily chats.",
    gender: "female" as const,
    pronouns: "she/her",
  },
  {
    id: "2",
    name: "Kenji",
    native: "Japanese",
    learning: "Spanish",
    status: "Recently Active",
    bio: "Learns Spanish for travel. Likes music.",
    gender: "male" as const,
    pronouns: "he/him",
  },
  {
    id: "3",
    name: "Amina",
    native: "Arabic",
    learning: "French",
    status: "Online",
    bio: "Teacher, available on weekends.",
    gender: "female" as const,
    pronouns: "she/her",
  },
  {
    id: "4",
    name: "Luca",
    native: "Italian",
    learning: "English",
    status: "Recently Active",
    bio: "Foodie and cyclist.",
    gender: "non-binary" as const,
    pronouns: "they/them",
  },
  {
    id: "5",
    name: "Sofia",
    native: "Portuguese",
    learning: "German",
    status: "Online",
    bio: "Student, weekday evenings.",
    gender: "female" as const,
    pronouns: "she/her",
  },
];

export default function ChatScreen() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const styles = createStyles(theme.colors);

  const chatId =
    currentUser && partner
      ? [currentUser.id, partner.id].sort().join("-")
      : null;

  const [chatList, setChatList] = useState<
    {
      key: string;
      partner: Partner;
      lastMessage?: Message;
    }[]
  >([]);

  // Load partner and chat history
  useEffect(() => {
    const loadChat = async () => {
      // If partnerId is present, load that conversation
      if (params.partnerId && currentUser) {
        const foundPartner =
          MOCK_PARTNERS.find((p) => p.id === params.partnerId) || null;
        if (!foundPartner) {
          router.back();
          return;
        }
        setPartner(foundPartner);

        try {
          const key = `chat-${[currentUser.id, foundPartner.id]
            .sort()
            .join("-")}`;
          const saved = await AsyncStorage.getItem(key);
          if (saved) {
            setMessages(JSON.parse(saved));
          } else {
            setMessages([]);
          }
        } catch (e) {
          console.warn("Failed to load chat history", e);
        }
        return;
      }

      // Otherwise, show chat list: load all keys starting with 'chat-'
      if (!currentUser) return;

      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const chatKeys = allKeys.filter((k) => k.startsWith("chat-"));
        if (chatKeys.length === 0) {
          setChatList([]);
          return;
        }
        const entries = await AsyncStorage.multiGet(chatKeys);
        const list = entries.map(([key, value]) => {
          let msgs: Message[] = [];
          try {
            msgs = value ? JSON.parse(value) : [];
          } catch {
            msgs = [];
          }
          const idPart = key.replace("chat-", "");
          const ids = idPart.split("-");
          const otherId = ids.find((id) => id !== currentUser.id) || ids[0];

          const foundPartner =
            MOCK_PARTNERS.find((p) => p.id === otherId) ||
            ({
              id: otherId,
              name: "Unknown",
              native: "",
              learning: "",
              status: "Recently Active",
            } as Partner);

          return {
            key,
            partner: foundPartner,
            lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : undefined,
          };
        });

        // sort by last message timestamp desc
        list.sort(
          (a, b) =>
            (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
        );
        setChatList(list);
      } catch (e) {
        console.warn("Failed to load chat list", e);
      }
    };

    loadChat();
  }, [params.partnerId, currentUser]);

  // Save messages when they change
  useEffect(() => {
    const saveMessages = async () => {
      if (!chatId || messages.length === 0) return;
      try {
        await AsyncStorage.setItem(`chat-${chatId}`, JSON.stringify(messages));
      } catch (e) {
        console.warn("Failed to save messages", e);
      }
    };

    saveMessages();
  }, [messages, chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !currentUser || !partner) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      senderId: currentUser.id,
      receiverId: partner.id,
      senderName: currentUser.firstName || currentUser.username,
      timestamp: Date.now(),
      language: (params.language as string) || currentUser.learning || "en",
      read: false,
      chatId: chatId || undefined,
    };

    // Optimistically update UI and persist immediately so chat list sees it
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setMessage("");

    try {
      const key = `chat-${[currentUser.id, partner.id].sort().join("-")}`;
      await AsyncStorage.setItem(key, JSON.stringify(newMessages));
    } catch (e) {
      console.warn("Failed to persist new message", e);
    }
  };

  if (!currentUser) {
    router.replace("/");
    return null;
  }

  if (!partner) {
    // If there's no partner param we show the chat list
    if (!params.partnerId) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Chats</Text>
            </View>
          </View>

          <FlatList
            data={chatList}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => {
              const last = item.lastMessage;
              return (
                <TouchableOpacity
                  style={styles.chatListItem}
                  onPress={() =>
                    router.push(`/chat?partnerId=${item.partner.id}`)
                  }
                >
                  <Avatar
                    name={item.partner.name}
                    gender={item.partner.gender}
                    size={48}
                  />
                  <View style={styles.chatListInfo}>
                    <Text style={styles.name}>{item.partner.name}</Text>
                    <Text style={styles.chatLastText} numberOfLines={1}>
                      {last ? last.text : "No messages yet"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.timestamp}>
                      {last
                        ? new Date(last.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      );
    }

    return null;
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = currentUser?.id === item.senderId;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageLanguage}>{item.language}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              // clear local partner state and navigate back to chat list
              setPartner(null);
              setMessages([]);
              router.replace("/chat");
            }}
            style={styles.backButtonContainer}
          >
            <Text style={styles.backButton}>{`<`}</Text>
          </TouchableOpacity>
          <Avatar name={partner.name} gender={partner.gender} size={40} />
          <View>
            <Text style={styles.headerTitle}>{partner.name}</Text>
            <Text style={styles.headerSubtitle}>
              Chatting in {params.language || partner.native}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.muted}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !message.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 2,
    },
    messageList: {
      padding: 16,
      gap: 8,
    },
    chatListItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      gap: 12,
    },
    chatListInfo: { flex: 1 },
    chatLastText: { color: colors.muted, marginTop: 4 },
    name: { fontWeight: "700", color: colors.text, fontSize: 16 },
    backButton: { fontSize: 22, color: colors.primary, marginRight: 8 },
    backButtonContainer: { padding: 6, marginRight: 6 },
    messageBubble: {
      maxWidth: "80%",
      padding: 12,
      borderRadius: 16,
      marginBottom: 8,
    },
    userMessage: {
      backgroundColor: colors.primary,
      alignSelf: "flex-end",
      borderBottomRightRadius: 4,
    },
    otherMessage: {
      backgroundColor: colors.card,
      alignSelf: "flex-start",
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 16,
    },
    userMessageText: {
      color: "white",
    },
    otherMessageText: {
      color: colors.text,
    },
    messageFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
      gap: 8,
    },
    messageLanguage: {
      fontSize: 12,
      color: colors.muted,
      textTransform: "uppercase",
    },
    timestamp: {
      fontSize: 12,
      color: colors.muted,
    },
    inputContainer: {
      flexDirection: "row",
      padding: 16,
      gap: 8,
      backgroundColor: colors.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.muted,
    },
    input: {
      flex: 1,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 20,
      fontSize: 16,
      color: colors.text,
      maxHeight: 100,
    },
    sendButton: {
      paddingHorizontal: 16,
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      color: "white",
      fontWeight: "600",
    },
  });
