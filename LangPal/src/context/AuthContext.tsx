import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Partner } from "../types";

type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  password: string;
  dob?: string;
  native?: string;
  learning?: string;
  gender?: Partner["gender"];
  pronouns?: string;
  avatarUri?: string | null;
};

type AuthContextValue = {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  signUp: (u: User) => Promise<{ ok: boolean; error?: string }>;
  login: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  usernameAvailable: (username: string) => boolean;
};

const USERS_KEY = "LP_USERS_V1";
const CURRENT_KEY = "LP_CURRENT_V1";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(USERS_KEY);
        const saved = raw ? JSON.parse(raw) : null;
        const cur = await AsyncStorage.getItem(CURRENT_KEY);
        const curUser = cur ? JSON.parse(cur) : null;
        if (saved && Array.isArray(saved)) setUsers(saved);
        if (curUser) setCurrentUser(curUser);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistUsers = async (next: User[]) => {
    setUsers(next);
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(next));
    } catch {}
  };

  const persistCurrent = async (u: User | null) => {
    setCurrentUser(u);
    try {
      if (u) await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify(u));
      else await AsyncStorage.removeItem(CURRENT_KEY);
    } catch {}
  };

  // Cache username validation results to prevent unnecessary re-renders
  const usernameCache = new Map<string, boolean>();

  const usernameAvailable = (username: string) => {
    const lower = username.toLowerCase();
    if (usernameCache.has(lower)) {
      return usernameCache.get(lower)!;
    }
    const result = !users.some((u) => u.username.toLowerCase() === lower);
    usernameCache.set(lower, result);
    return result;
  };

  const signUp = async (u: User) => {
    if (!usernameAvailable(u.username))
      return { ok: false, error: "Username already taken" };
    const next = [...users, u];
    await persistUsers(next);
    await persistCurrent(u);
    return { ok: true };
  };

  const login = async (username: string, password: string) => {
    const found = users.find(
      (x) => x.username === username && x.password === password
    );
    if (!found) return { ok: false, error: "Invalid credentials" };
    await persistCurrent(found);
    return { ok: true };
  };

  const logout = async () => {
    await persistCurrent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        loading,
        signUp,
        login,
        logout,
        usernameAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
