import React, { useState, useEffect, createContext, useContext } from "react";
import { api } from "./api";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";

export interface OperatorUser {
  name: string;
  email: string;
  role: string;
  terminalId: string;
}

interface AuthContextType {
  user: OperatorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OperatorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state and listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Set authorization token for all backend calls
          api.setToken(token);

          const role = firebaseUser.email === "admin@windcast.ai" ? "Super-Administrator" : "Grid-Operator";
          const operatorUser: OperatorUser = {
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Operator User",
            email: firebaseUser.email || "",
            role: role,
            terminalId: `WCAST-NODE-${firebaseUser.uid.substring(0, 5).toUpperCase()}`,
          };

          setUser(operatorUser);
          localStorage.setItem("windcast_user", JSON.stringify(operatorUser));
        } catch (error) {
          console.error("Error setting up Firebase authenticated user:", error);
          setUser(null);
          api.setToken(null);
          localStorage.removeItem("windcast_user");
        }
      } else {
        setUser(null);
        api.setToken(null);
        localStorage.removeItem("windcast_user");
        localStorage.removeItem("windcast_auth_token");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase Login Error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase Signup Error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase Google SSO Error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase SignOut Error:", error);
    } finally {
      setUser(null);
      api.setToken(null);
      localStorage.removeItem("windcast_user");
      localStorage.removeItem("windcast_auth_token");
      setIsLoading(false);
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signInWithGoogle,
        signup,
      },
    },
    children
  );
}
