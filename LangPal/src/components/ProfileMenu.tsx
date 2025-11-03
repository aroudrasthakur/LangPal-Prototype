import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function ProfileMenu() {
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const onLogout = async () => {
    await auth.logout();
    setIsOpen(false);
  };

  if (!auth.currentUser) return null;

  // On web, use a proper dropdown menu
  if (Platform.OS === "web") {
    return (
      <div style={styles.webContainer}>
        <button onClick={() => setIsOpen(!isOpen)} style={styles.webButton}>
          <Avatar
            name={`${auth.currentUser.firstName} ${auth.currentUser.lastName}`}
            gender={auth.currentUser.gender}
            uri={auth.currentUser.avatarUri}
            size={32}
          />
        </button>
        {isOpen && (
          <div style={styles.webMenu}>
            <button onClick={onLogout} style={styles.webMenuItem}>
              Log out
            </button>
          </div>
        )}
      </div>
    );
  }

  // On native, use a modal or overlay menu
  return (
    <View>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
        <Avatar
          name={`${auth.currentUser.firstName} ${auth.currentUser.lastName}`}
          gender={auth.currentUser.gender}
          uri={auth.currentUser.avatarUri}
          size={32}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
            <Text>Log out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 140,
  },
  menuItem: {
    padding: 8,
    borderRadius: 4,
  },
  webContainer: {
    position: "relative",
  } as any,
  webButton: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  } as any,
  webMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    minWidth: 140,
  } as any,
  webMenuItem: {
    background: "none",
    border: "none",
    padding: 8,
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: 4,
  } as any,
});
