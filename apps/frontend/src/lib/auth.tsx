import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

/**
 * Mock de auth com a MESMA shape do Supabase Auth.
 * Aqui simulamos chamadas — quando integrar o Supabase real, basta
 * trocar o corpo dos métodos por supabase.auth.signInWithPassword etc.
 */

export type Role = "member" | "manager";

export type GWUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  company: string;
  avatarInitials: string;
};

export type GWSession = {
  access_token: string;
  user: GWUser;
};

type AuthCtx = {
  session: GWSession | null;
  user: GWUser | null;
  loading: boolean;
  signInWithPassword: (args: { email: string; password: string; role?: Role }) => Promise<{ error: string | null }>;
  signUp: (args: { name: string; email: string; password: string; role: Role }) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: "google") => Promise<{ error: string | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  switchRole: (role: Role) => void;
};

const STORAGE_KEY = "gw.session.v1";

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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "GW";
}

function fakeUser(email: string, role: Role, name?: string): GWUser {
  const displayName = name?.trim() || email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: `usr_${btoa(email).slice(0, 10)}`,
    email,
    name: displayName,
    role,
    company: "GOODWORK HQ",
    avatarInitials: initials(displayName),
  };
}

function delay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GWSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Hidratação (equivalente a supabase.auth.getSession + onAuthStateChange)
  useEffect(() => {
    setSession(readStored());
    setLoading(false);
  }, []);

  const setAndPersist = useCallback((s: GWSession | null) => {
    setSession(s);
    writeStored(s);
  }, []);

  const signInWithPassword: AuthCtx["signInWithPassword"] = useCallback(async ({ email, password, role = "member" }) => {
    await delay(650);
    if (!email || !password) return { error: "Informe e-mail e senha." };
    if (password.length < 4) return { error: "Senha muito curta (mínimo 4 caracteres no demo)." };
    // E-mails contendo "manager" ou "admin" entram como gestor automaticamente
    const resolved: Role = /manager|admin|gestor/i.test(email) ? "manager" : role;
    const user = fakeUser(email, resolved);
    setAndPersist({ access_token: `mock.${user.id}.${Date.now()}`, user });
    return { error: null };
  }, [setAndPersist]);

  const signUp: AuthCtx["signUp"] = useCallback(async ({ name, email, password, role }) => {
    await delay(800);
    if (!name || !email || !password) return { error: "Preencha todos os campos." };
    if (password.length < 8) return { error: "A senha precisa ter ao menos 8 caracteres." };
    const user = fakeUser(email, role, name);
    setAndPersist({ access_token: `mock.${user.id}.${Date.now()}`, user });
    return { error: null };
  }, [setAndPersist]);

  const signInWithOAuth: AuthCtx["signInWithOAuth"] = useCallback(async () => {
    await delay(500);
    const user = fakeUser("ana.martins@goodwork.io", "manager", "Ana Martins");
    setAndPersist({ access_token: `mock.${user.id}.${Date.now()}`, user });
    return { error: null };
  }, [setAndPersist]);

  const resetPasswordForEmail: AuthCtx["resetPasswordForEmail"] = useCallback(async (email) => {
    await delay(700);
    if (!email) return { error: "Informe seu e-mail." };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await delay(200);
    setAndPersist(null);
  }, [setAndPersist]);

  const switchRole = useCallback((role: Role) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, role } };
      writeStored(next);
      return next;
    });
  }, []);

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
        switchRole,
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

/** Rotas exclusivas do gestor */
export const MANAGER_ROUTES = ["/dashboard", "/analytics", "/supplies"] as const;

export function isManagerRoute(pathname: string) {
  return MANAGER_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
