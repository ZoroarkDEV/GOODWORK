import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type Role = "user" | "manager" | "admin";

export type GWUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type GWSession = {
  token: string;
  user: GWUser;
};

type AuthCtx = {
  session: GWSession | null;
  user: GWUser | null;
  loading: boolean;
  signInWithPassword: (args: { email: string; password: string }) => Promise<{ error: string | null }>;
  signUp: (args: { name: string; email: string; password: string; role: Role }) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: "google") => Promise<{ error: string | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = "gw.session.v1";
const API_BASE = "/api";

const AuthContext = createContext<AuthCtx | null>(null);

function readStored(): GWSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GWSession) : null;
  } catch {
    return null;
  }
}

function writeStored(s: GWSession | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  else localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GWSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(readStored());
    setLoading(false);
  }, []);

  const setAndPersist = useCallback((s: GWSession | null) => {
    setSession(s);
    writeStored(s);
  }, []);

  const signInWithPassword: AuthCtx["signInWithPassword"] = useCallback(async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Erro ao fazer login." };
      setAndPersist({ token: data.token, user: data.user });
      return { error: null };
    } catch {
      return { error: "Erro de conexão com o servidor." };
    }
  }, [setAndPersist]);

  const signUp: AuthCtx["signUp"] = useCallback(async ({ name, email, password, role }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Erro ao criar conta." };
      // Auto-login after signup
      return await signInWithPassword({ email, password });
    } catch {
      return { error: "Erro de conexão com o servidor." };
    }
  }, [signInWithPassword]);

  const signInWithOAuth: AuthCtx["signInWithOAuth"] = useCallback(async () => {
    return { error: "OAuth ainda não implementado. Use e-mail e senha." };
  }, []);

  const resetPasswordForEmail: AuthCtx["resetPasswordForEmail"] = useCallback(async (email) => {
    if (!email) return { error: "Informe seu e-mail." };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setAndPersist(null);
  }, [setAndPersist]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signInWithPassword,
        signUp,
        signInWithOAuth,
        resetPasswordForEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}

/** Rotas exclusivas do gestor/admin */
export const MANAGER_ROUTES = ["/dashboard", "/analytics", "/supplies"] as const;

export function isManagerRoute(pathname: string) {
  return MANAGER_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}