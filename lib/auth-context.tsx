"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, UserRole } from "./types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    email: string,
    password: string,
    fullname: string,
    role: "client" | "photographer",

  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function getUser() {
      try {
        const response = await fetch("/api/me");

        if (!response.ok) {
          if (isMounted) {
            setUser(null);
          }
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setUser(
            data.user
              ? {
                  id: String(data.user.id),
                  email: data.user.email,
                  fullname: data.user.fullname  || "User",
                  role: (data.user.role as UserRole) || "client",
                  createdAt: new Date(),
                }
              : null
          );
        }
      } catch (error) {
        console.error("Failed to load auth user:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    getUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    
const contentType = response.headers.get("content-type");if (!contentType || !contentType.includes("application/json")) {const textError = await response.text();console.error("Server returned non-JSON response:", textError);throw new Error("Server configuration error. Expected JSON, got HTML.");}

const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    const normalizedUser: User = {
      id: String(data.user.id),
      email: data.user.email || email,
      fullname: data.user.fullname || data.user.name || "User",
      role: (data.user.role as UserRole) || "client",
      createdAt: new Date(),
    };

    setUser(normalizedUser);
    return normalizedUser;
  };

  const signup = async (
    email: string,
    password: string,
    fullname: string,
    role: "client" | "photographer"
  ) => {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullname,
        role,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.user) {
      throw new Error(data?.error || "Signup failed");
    }

    setUser({
      id: String(data.user.id),
      email: data.user.email || email,
      fullname: data.user.fullname || fullname,
      role: (data.user.role as UserRole) || role,
      createdAt: new Date(),
    });
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
