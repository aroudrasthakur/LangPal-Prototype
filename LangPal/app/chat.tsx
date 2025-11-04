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
  Modal,
  Pressable,
  Alert,
  ToastAndroid,
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
  const { currentUser, users } = useAuth();
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
      unreadCount?: number;
    }[]
  >([]);

  // Long-press actions state for chat list items
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    key: string;
    partner: Partner;
    lastMessage?: Message;
  } | null>(null);
  const REPORT_REASONS = [
    "Harassment or bullying",
    "Spam or scam",
    "Inappropriate content",
    "Hate speech",
    "Other",
  ];
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [reportDescription, setReportDescription] = useState("");
  // Toast/snackbar for lightweight feedback
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    if (Platform.OS === "android") return; // Android uses native Toast
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Mark conversation as read when opening and update message read status
  useEffect(() => {
    if (!chatId || !currentUser || !partner) return;

    const markAsRead = async () => {
      try {
        const key = `chat-${chatId}`;
        const lastReadKey = `lastRead-${key}`;
        await AsyncStorage.setItem(lastReadKey, Date.now().toString());

        // Mark all messages from partner as read
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          const msgs: Message[] = JSON.parse(saved);
          let updated = false;
          const updatedMessages = msgs.map((msg) => {
            if (msg.senderId !== currentUser.id && !msg.read) {
              updated = true;
              return { ...msg, read: true };
            }
            return msg;
          });

          if (updated) {
            await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
            setMessages(updatedMessages);
          }
        }
      } catch (e) {
        console.warn("Failed to mark as read", e);
      }
    };

    markAsRead();
  }, [chatId, currentUser, partner]);

  // Load partner and chat history
  useEffect(() => {
    const loadChat = async () => {
      // If partnerId is present, load that conversation
      if (params.partnerId && currentUser) {
        let foundPartner =
          MOCK_PARTNERS.find((p) => p.id === params.partnerId) || null;

        // If not found in mock partners, check real users
        if (!foundPartner) {
          const foundUser = users.find((u) => u.id === params.partnerId);
          if (foundUser) {
            foundPartner = {
              id: foundUser.id,
              name: foundUser.firstName
                ? `${foundUser.firstName} ${foundUser.lastName || ""}`.trim()
                : foundUser.username,
              native: foundUser.native || "",
              learning: foundUser.learning || "",
              status: "Online",
              bio: "",
              gender: foundUser.gender,
            } as Partner;
          }
        }

        if (!foundPartner) {
          // Invalid partner id: safely return to chat list instead of attempting a back with no history
          router.replace("/chat");
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
        // Only consider chat keys that include the current user's id in the pair
        const chatKeys = allKeys.filter((k) => {
          if (!k.startsWith("chat-")) return false;
          const ids = k.replace("chat-", "").split("-");
          return ids.includes(currentUser.id);
        });

        // Load deleted chats and blocked users for this user
        const deletedKey = `deletedChats-${currentUser.id}`;
        const blockedKey = `blockedUsers-${currentUser.id}`;
        const deletedChatsStr = await AsyncStorage.getItem(deletedKey);
        const blockedUsersStr = await AsyncStorage.getItem(blockedKey);
        const deletedChats = deletedChatsStr ? JSON.parse(deletedChatsStr) : [];
        const blockedUsers = blockedUsersStr ? JSON.parse(blockedUsersStr) : [];

        if (chatKeys.length === 0) {
          setChatList([]);
          return;
        }
        const entries = await AsyncStorage.multiGet(chatKeys);
        const list = entries
          .map(([key, value]) => {
            let msgs: Message[] = [];
            try {
              msgs = value ? JSON.parse(value) : [];
            } catch {
              msgs = [];
            }
            // Only surface chats that actually have history for this user
            if (!msgs || msgs.length === 0) return null;

            const idPart = key.replace("chat-", "");
            const ids = idPart.split("-");
            const otherId = ids.find((id) => id !== currentUser.id) || ids[0];

            let foundPartner = MOCK_PARTNERS.find((p) => p.id === otherId);

            // If not in mock partners, check real users
            if (!foundPartner) {
              const foundUser = users.find((u) => u.id === otherId);
              if (foundUser) {
                foundPartner = {
                  id: foundUser.id,
                  name: foundUser.firstName
                    ? `${foundUser.firstName} ${
                        foundUser.lastName || ""
                      }`.trim()
                    : foundUser.username,
                  native: foundUser.native || "",
                  learning: foundUser.learning || "",
                  status: "Online",
                  bio: "",
                  gender: foundUser.gender,
                } as Partner;
              }
            }

            // Final fallback if still not found
            if (!foundPartner) {
              foundPartner = {
                id: otherId,
                name: "Unknown",
                native: "",
                learning: "",
                status: "Recently Active",
              } as Partner;
            }

            // Calculate unread messages (async)
            const lastReadKey = `lastRead-${key}`;
            AsyncStorage.getItem(lastReadKey).then((lastReadStr) => {
              const lastReadTimestamp = lastReadStr
                ? parseInt(lastReadStr, 10)
                : 0;
              const unread = msgs.filter(
                (m) =>
                  m.senderId !== currentUser.id &&
                  m.timestamp > lastReadTimestamp
              ).length;
              // Update the chat list item with unread count
              setChatList((prev) =>
                prev.map((item) =>
                  item.key === key ? { ...item, unreadCount: unread } : item
                )
              );
            });

            return {
              key,
              partner: foundPartner,
              lastMessage: msgs[msgs.length - 1],
              unreadCount: 0, // Will be updated async
            };
          })
          .filter(
            (
              x
            ): x is {
              key: string;
              partner: Partner;
              lastMessage: Message;
              unreadCount: number;
            } => {
              if (!x) return false;
              // Filter out deleted chats and blocked users
              const chatKey = x.key.replace("chat-", "");
              if (deletedChats.includes(chatKey)) return false;
              if (blockedUsers.includes(x.partner.id)) return false;
              return true;
            }
          );

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
  }, [params.partnerId, currentUser, users]);

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

  // Poll for new messages in active conversation (live chat)
  useEffect(() => {
    if (!chatId || !currentUser || !partner) return;

    const pollMessages = async () => {
      try {
        const key = `chat-${chatId}`;
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          const storedMessages = JSON.parse(saved);
          // Update if there are changes (new messages or read status updates)
          if (
            storedMessages.length !== messages.length ||
            JSON.stringify(storedMessages) !== JSON.stringify(messages)
          ) {
            setMessages(storedMessages);

            // Auto-mark new messages from partner as read
            const hasUnreadFromPartner = storedMessages.some(
              (m: Message) => m.senderId !== currentUser.id && !m.read
            );
            if (hasUnreadFromPartner) {
              const updatedMessages = storedMessages.map((msg: Message) => {
                if (msg.senderId !== currentUser.id && !msg.read) {
                  return { ...msg, read: true };
                }
                return msg;
              });
              await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
              setMessages(updatedMessages);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to poll messages", e);
      }
    };

    // Poll every 2 seconds for new messages
    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [chatId, currentUser, partner, messages]);

  // Poll for new messages in chat list
  useEffect(() => {
    if (params.partnerId || !currentUser) return; // Only poll when showing chat list

    const pollChatList = async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const chatKeys = allKeys.filter((k) => {
          if (!k.startsWith("chat-")) return false;
          const ids = k.replace("chat-", "").split("-");
          return ids.includes(currentUser.id);
        });

        if (chatKeys.length === 0) {
          setChatList([]);
          return;
        }

        const entries = await AsyncStorage.multiGet(chatKeys);
        const list = entries
          .map(([key, value]) => {
            let msgs: Message[] = [];
            try {
              msgs = value ? JSON.parse(value) : [];
            } catch {
              msgs = [];
            }
            if (!msgs || msgs.length === 0) return null;

            const idPart = key.replace("chat-", "");
            const ids = idPart.split("-");
            const otherId = ids.find((id) => id !== currentUser.id) || ids[0];

            let foundPartner = MOCK_PARTNERS.find((p) => p.id === otherId);

            if (!foundPartner) {
              const foundUser = users.find((u) => u.id === otherId);
              if (foundUser) {
                foundPartner = {
                  id: foundUser.id,
                  name: foundUser.firstName
                    ? `${foundUser.firstName} ${
                        foundUser.lastName || ""
                      }`.trim()
                    : foundUser.username,
                  native: foundUser.native || "",
                  learning: foundUser.learning || "",
                  status: "Online",
                  bio: "",
                  gender: foundUser.gender,
                } as Partner;
              }
            }

            if (!foundPartner) {
              foundPartner = {
                id: otherId,
                name: "Unknown",
                native: "",
                learning: "",
                status: "Recently Active",
              } as Partner;
            }

            return {
              key,
              partner: foundPartner,
              lastMessage: msgs[msgs.length - 1],
            };
          })
          .filter(
            (x): x is { key: string; partner: Partner; lastMessage: Message } =>
              !!x
          );

        list.sort(
          (a, b) =>
            (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
        );
        setChatList(list);
      } catch (e) {
        console.warn("Failed to poll chat list", e);
      }
    };

    // Poll every 3 seconds for chat list updates
    const interval = setInterval(pollChatList, 3000);
    return () => clearInterval(interval);
  }, [params.partnerId, currentUser, users]);

  const sendMessage = async () => {
    if (!message.trim() || !currentUser || !partner) return;

    // Check if current user is blocked by the partner
    try {
      const partnerBlockedKey = `blockedUsers-${partner.id}`;
      const blockedStr = await AsyncStorage.getItem(partnerBlockedKey);
      const blockedList = blockedStr ? JSON.parse(blockedStr) : [];
      if (blockedList.includes(currentUser.id)) {
        Alert.alert(
          "Message not sent",
          "You cannot send messages to this user."
        );
        return;
      }
    } catch (e) {
      console.warn("Failed to check block status", e);
    }

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

      // Remove chat from partner's deleted list if it was deleted (restore as new conversation)
      const partnerDeletedKey = `deletedChats-${partner.id}`;
      const partnerDeletedStr = await AsyncStorage.getItem(partnerDeletedKey);
      if (partnerDeletedStr) {
        const partnerDeletedList = JSON.parse(partnerDeletedStr);
        const chatKey = [currentUser.id, partner.id].sort().join("-");
        const index = partnerDeletedList.indexOf(chatKey);
        if (index > -1) {
          partnerDeletedList.splice(index, 1);
          await AsyncStorage.setItem(
            partnerDeletedKey,
            JSON.stringify(partnerDeletedList)
          );
        }
      }
    } catch (e) {
      console.warn("Failed to persist new message", e);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      router.replace("/");
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  if (!partner) {
    // If there's no partner param we show the chat list
    if (!params.partnerId) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.replace("/")}
                style={styles.backButtonContainer}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backButton}>{`<`}</Text>
              </TouchableOpacity>
              {/* Centered current username in the chat list header */}
              <Text
                style={styles.headerCenterTitle}
                numberOfLines={1}
                accessibilityRole="header"
              >
                {`@${currentUser.username}`}
              </Text>
            </View>
          </View>

          <FlatList
            data={chatList}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.messageList}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No conversation history</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/partners")}
                >
                  <Text style={styles.emptyButtonText}>Find Your LangPal</Text>
                </TouchableOpacity>
              </View>
            )}
            renderItem={({ item }) => {
              const last = item.lastMessage;
              const unread = item.unreadCount || 0;
              return (
                <TouchableOpacity
                  style={styles.chatListItem}
                  onPress={() =>
                    router.push(`/chat?partnerId=${item.partner.id}`)
                  }
                  onLongPress={() => {
                    setSelectedChat(item);
                    setShowActionsSheet(true);
                  }}
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
                  <View style={styles.chatListTimeColumn}>
                    <Text style={styles.timestamp}>
                      {last
                        ? new Date(last.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </Text>
                    {unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{unread}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Actions bottom sheet */}
          <Modal
            transparent
            animationType="fade"
            visible={showActionsSheet}
            onRequestClose={() => setShowActionsSheet(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowActionsSheet(false)}
            />
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Chat options</Text>
              <TouchableOpacity
                style={styles.sheetButton}
                onPress={() => {
                  setShowActionsSheet(false);
                  setShowReportModal(true);
                }}
              >
                <Text style={styles.sheetButtonText}>Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetButton, styles.warningButton]}
                onPress={() => {
                  if (!selectedChat || !currentUser) return;
                  Alert.alert(
                    "Block user?",
                    "This user will no longer be able to send you messages.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Block",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const blockedKey = `blockedUsers-${currentUser.id}`;
                            const existing = await AsyncStorage.getItem(
                              blockedKey
                            );
                            const blockedList = existing
                              ? JSON.parse(existing)
                              : [];
                            if (
                              !blockedList.includes(selectedChat.partner.id)
                            ) {
                              blockedList.push(selectedChat.partner.id);
                              await AsyncStorage.setItem(
                                blockedKey,
                                JSON.stringify(blockedList)
                              );
                            }
                            setChatList((prev) =>
                              prev.filter((c) => c.key !== selectedChat.key)
                            );
                            if (Platform.OS === "android") {
                              ToastAndroid.show(
                                "User blocked",
                                ToastAndroid.SHORT
                              );
                            } else {
                              setToast("User blocked");
                            }
                          } catch (e) {
                            console.warn("Failed to block user", e);
                          } finally {
                            setShowActionsSheet(false);
                            setSelectedChat(null);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={[styles.sheetButtonText, styles.warningText]}>
                  Block
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetButton, styles.destructiveButton]}
                onPress={() => {
                  if (!selectedChat || !currentUser) return;
                  Alert.alert(
                    "Delete chat?",
                    "This will remove the conversation from your view. The other person can still see it.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            // Add to deleted chats list for this user only
                            const deletedKey = `deletedChats-${currentUser.id}`;
                            const existing = await AsyncStorage.getItem(
                              deletedKey
                            );
                            const deletedList = existing
                              ? JSON.parse(existing)
                              : [];
                            const chatKey = selectedChat.key.replace(
                              "chat-",
                              ""
                            );
                            if (!deletedList.includes(chatKey)) {
                              deletedList.push(chatKey);
                              await AsyncStorage.setItem(
                                deletedKey,
                                JSON.stringify(deletedList)
                              );
                            }
                            setChatList((prev) =>
                              prev.filter((c) => c.key !== selectedChat.key)
                            );
                            if (Platform.OS === "android") {
                              ToastAndroid.show(
                                "Chat deleted",
                                ToastAndroid.SHORT
                              );
                            } else {
                              setToast("Chat deleted");
                            }
                          } catch (e) {
                            console.warn("Failed to delete chat", e);
                          } finally {
                            setShowActionsSheet(false);
                            setSelectedChat(null);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={[styles.sheetButtonText, styles.destructiveText]}>
                  Delete
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetButton, styles.cancelButton]}
                onPress={() => setShowActionsSheet(false)}
              >
                <Text style={styles.sheetButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* Report modal */}
          <Modal
            transparent
            animationType="slide"
            visible={showReportModal}
            onRequestClose={() => setShowReportModal(false)}
          >
            <View style={styles.modalOverlay} />
            <View style={styles.reportContainer}>
              <Text style={styles.reportTitle}>Report conversation</Text>
              <Text style={styles.reportSubtitle}>
                Select a reason and describe the issue. Our team will review.
              </Text>
              <View style={styles.reasonsContainer}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonChip,
                      reportReason === reason && styles.reasonChipSelected,
                    ]}
                    onPress={() => setReportReason(reason)}
                  >
                    <Text
                      style={[
                        styles.reasonChipText,
                        reportReason === reason &&
                          styles.reasonChipTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reportInput}
                placeholder="Add details (optional)"
                placeholderTextColor={theme.colors.muted}
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
              />
              <View style={styles.reportButtonsRow}>
                <TouchableOpacity
                  style={[styles.reportButton, styles.cancelButtonOutline]}
                  onPress={() => {
                    setShowReportModal(false);
                    setReportReason(null);
                    setReportDescription("");
                    setSelectedChat(null);
                  }}
                >
                  <Text style={styles.reportButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reportButton, styles.submitButton]}
                  onPress={async () => {
                    if (!selectedChat || !currentUser) return;
                    // Confirm submission
                    Alert.alert(
                      "Submit report?",
                      "We'll review this conversation. You can add more details anytime.",
                      [
                        { text: "No", style: "cancel" },
                        {
                          text: "Yes",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              const existing = await AsyncStorage.getItem(
                                "reports"
                              );
                              const reports = existing
                                ? JSON.parse(existing)
                                : [];
                              reports.push({
                                id: Date.now().toString(),
                                userId: currentUser.id,
                                partnerId: selectedChat.partner.id,
                                reason: reportReason,
                                description: reportDescription,
                                timestamp: Date.now(),
                              });
                              await AsyncStorage.setItem(
                                "reports",
                                JSON.stringify(reports)
                              );
                              Alert.alert(
                                "Report submitted",
                                "Thank you for helping keep LangPal safe."
                              );
                            } catch (e) {
                              console.warn("Failed to save report", e);
                            } finally {
                              setShowReportModal(false);
                              setReportReason(null);
                              setReportDescription("");
                              setSelectedChat(null);
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.reportButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {toast && (
            <View style={styles.toastContainer} pointerEvents="none">
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          )}
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
          <View style={styles.messageMetaRow}>
            <Text
              style={[
                styles.messageLanguage,
                isOwnMessage && styles.userMessageMeta,
              ]}
            >
              {item.language}
            </Text>
            <Text
              style={[styles.timestamp, isOwnMessage && styles.userMessageMeta]}
            >
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {isOwnMessage && (
            <Text
              style={[styles.readReceipt, item.read && styles.readReceiptRead]}
            >
              {item.read ? "Read" : "Delivered"}
            </Text>
          )}
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
          <Text style={[styles.headerTitle, { marginLeft: 4 }]}>
            {partner.name}
          </Text>
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
      paddingTop: 60,
      paddingBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.muted,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 8,
    },
    headerCenterTitle: {
      position: "absolute",
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    headerTitle: {
      fontSize: 17,
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
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 64,
      gap: 16,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 16,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    emptyButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 15,
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
    chatListTimeColumn: {
      alignItems: "flex-end",
      gap: 4,
    },
    unreadBadge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    unreadText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
    },
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
      marginTop: 4,
      gap: 4,
    },
    messageMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    messageLanguage: {
      fontSize: 12,
      color: colors.muted,
      textTransform: "uppercase",
    },
    userMessageMeta: {
      color: "rgba(255, 255, 255, 0.8)",
    },
    timestamp: {
      fontSize: 12,
      color: colors.muted,
    },
    readReceipt: {
      fontSize: 11,
      color: "rgba(255, 255, 255, 0.6)",
      fontStyle: "italic",
    },
    readReceiptRead: {
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: "600",
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
    sendButtonText: { color: "white", fontWeight: "600" },
    // Modal / sheet styles
    modalOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    bottomSheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.card,
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      gap: 8,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    sheetButton: {
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    sheetButtonText: {
      color: colors.text,
      fontWeight: "600",
    },
    destructiveButton: {
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#E53E3E",
    },
    destructiveText: {
      color: "#E53E3E",
      fontWeight: "700",
    },
    warningButton: {
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#FF8C00",
    },
    warningText: {
      color: "#FF8C00",
      fontWeight: "700",
    },
    cancelButton: {
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.muted,
    },
    // Report modal
    reportContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      gap: 12,
    },
    reportTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    reportSubtitle: {
      color: colors.muted,
      fontSize: 14,
    },
    reasonsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    reasonChip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.muted,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.background,
    },
    reasonChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    reasonChipText: {
      color: colors.text,
      fontWeight: "600",
    },
    reasonChipTextSelected: {
      color: "#fff",
    },
    reportInput: {
      backgroundColor: colors.background,
      borderRadius: 12,
      minHeight: 80,
      padding: 12,
      color: colors.text,
    },
    reportButtonsRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 8,
    },
    reportButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    cancelButtonOutline: {
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.muted,
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    reportButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
    // Toast
    toastContainer: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 24,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.muted,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    toastText: {
      color: colors.text,
      fontWeight: "600",
    },
  });
