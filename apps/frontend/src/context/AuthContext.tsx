/**
 * AuthContext - Contexto de autenticação do GOODWORK.
 * Gerencia login, logout e persistência de sessão via localStorage.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "manager" | "employee";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_TOKEN = "goodwork_token";
const STORAGE_KEY_USER = "goodwork_user";

// Mock user for presentation
const MOCK_USER: User = {
  id: "user-demo-001",
  name: "Demo User",
  email: "demo@goodwork.com",
  role: "manager",
  avatar: undefined,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Invalid data in storage, clear it
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Try API first, fallback to mock
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: _password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
        setUser(data.user);
        return;
      }
    } catch {
      // API not available, use mock
    }

    // Mock login for presentation
    if (email && _password) {
      const mockUser = { ...MOCK_USER, email };
      localStorage.setItem(STORAGE_KEY_TOKEN, "mock-token-demo");
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      throw new Error("Email e senha são obrigatórios");
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    // Try API first, fallback to mock
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: _password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
        setUser(data.user);
        return;
      }
    } catch {
      // API not available, use mock
    }

    // Mock register for presentation
    if (name && email && _password) {
      const mockUser = { ...MOCK_USER, name, email };
      localStorage.setItem(STORAGE_KEY_TOKEN, "mock-token-demo");
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      throw new Error("Todos os campos são obrigatórios");
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}