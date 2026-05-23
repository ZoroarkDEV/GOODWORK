import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "./supabaseClient";

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
};

const AuthContext = createContext<AuthCtx | null>(null);

function mapSupabaseUser(session: any): GWUser | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email ?? "",
    name: u.user_metadata?.name ?? u.email?.split("@")[0] ?? "Usuário",
    role: (u.user_metadata?.role as Role) ?? "user",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GWUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session));
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn: AuthCtx["signIn"] = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Map common Supabase errors to friendly Portuguese messages
      const msg = error.message.includes("Invalid login credentials")
        ? "Credenciais inválidas. Verifique seu e-mail e senha."
        : error.message.includes("Email not confirmed")
          ? "E-mail não confirmado. Verifique sua caixa de entrada."
          : error.message;
      return { error: msg };
    }
    return { error: null };
  }, []);

  const signUp: AuthCtx["signUp"] = useCallback(async ({ name, email, password, role }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    if (error) {
      const msg = error.message.includes("already registered")
        ? "Este e-mail já está cadastrado."
        : error.message;
      return { error: msg };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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