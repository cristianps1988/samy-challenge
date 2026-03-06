"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import { clearTokenCache } from "@/lib/api-client";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isMounted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const tokenListeners = new Set<() => void>();

function subscribeToToken(callback: () => void): () => void {
  tokenListeners.add(callback);
  return () => {
    tokenListeners.delete(callback);
  };
}

function getTokenSnapshot(): string | null {
  return Cookies.get("token") ?? null;
}

function notifyTokenListeners(): void {
  tokenListeners.forEach((cb) => cb());
}

const subscribeToMount = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({
  children,
  initialToken = null,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  const [isLoading] = useState(false);

  const token = useSyncExternalStore(
    subscribeToToken,
    getTokenSnapshot,
    () => initialToken
  );

  const isMounted = useSyncExternalStore(
    subscribeToMount,
    getMountedSnapshot,
    getServerMountedSnapshot
  );

  const login = async (email: string, password: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }));
      throw new Error(error.error?.message || error.message || "Invalid credentials");
    }

    const data = await response.json();
    const receivedToken = data.data?.token;

    if (!receivedToken) {
      throw new Error("No token received");
    }

    Cookies.set("token", receivedToken, { path: "/", sameSite: "lax" });
    notifyTokenListeners();
  };

  const logout = () => {
    Cookies.remove("token", { path: "/" });
    notifyTokenListeners();
    clearTokenCache();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        isMounted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
