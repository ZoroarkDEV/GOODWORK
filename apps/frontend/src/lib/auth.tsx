import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Role = "user" | "manager" | "admin";

export type GWUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

type AuthCtx = {
  user: GWUser | null;
  loading: boolean;
  signIn: (args: { email: string; password: string }) => Promise<{ error: string | null }>;
  signUp: (args: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthCtx | null>(null);

const TOKEN_KEY = "goodwork_token";
const USER_KEY = "goodwork_user";

function getStoredUser(): GWUser | null {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeSession(token: string, user: GWUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GWUser | null>(getStoredUser);
  const [loading, setLoading] = useState(true); // Start as true to prevent flash

  // Simulate initial auth check
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const signIn: AuthCtx["signIn"] = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        storeSession(data.token, data.user);
        setUser(data.user);
        setLoading(false);
        return { error: null };
      }
      setLoading(false);
      return { error: data.error || "Credenciais inválidas." };
    } catch {
      setLoading(false);
      return { error: "Erro de conexão com o servidor. Verifique se o backend está rodando." };
    }
  }, []);

  const signUp: AuthCtx["signUp"] = useCallback(async ({ name, email, password, role }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        return { error: null };
      }
      return { error: data.error || "Erro ao registrar." };
    } catch {
      return { error: "Erro de conexão com o servidor. Verifique se o backend está rodando." };
    }
  }, []);

  const signOut = useCallback(async () => {
    clearSession();
    setUser(null);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    try {
      console.log("Password reset requested for:", email);
      return { error: null };
    } catch {
      return { error: "Erro de conexão com o servidor." };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPasswordForEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

/** Manager-only routes */
export const MANAGER_ROUTES = ["/dashboard", "/analytics", "/supplies"] as const;

export function isManagerRoute(pathname: string) {
  return MANAGER_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}