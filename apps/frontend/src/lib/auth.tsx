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
  emailVerified: boolean;
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
  }) => Promise<{ error: string | null; needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthCtx | null>(null);

function mapSupabaseUser(supabaseUser: any, role: Role = "user"): GWUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "Usuário",
    role: supabaseUser.user_metadata?.role || role,
    emailVerified: !!supabaseUser.email_confirmed_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GWUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(supabaseUser: any) {
    try {
      // Try to get role from user metadata first
      let role: Role = supabaseUser.user_metadata?.role || "user";

      // If no role in metadata, try to fetch from database
      if (!supabaseUser.user_metadata?.role) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("role")
          .eq("id", supabaseUser.id)
          .single();
        
        if (dbUser?.role) {
          role = dbUser.role as Role;
        }
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "Usuário",
        role,
        emailVerified: !!supabaseUser.email_confirmed_at,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(mapSupabaseUser(supabaseUser));
    } finally {
      setLoading(false);
    }
  }

  const signIn: AuthCtx["signIn"] = useCallback(async ({ email, password }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // Map Supabase errors to Portuguese
        const errorMessages: Record<string, string> = {
          "Invalid login credentials": "Credenciais inválidas. Verifique seu e-mail e senha.",
          "Email not confirmed": "E-mail não verificado. Por favor, confirme seu e-mail antes de fazer login.",
          "Invalid email": "Formato de e-mail inválido.",
          "Too many requests": "Muitas tentativas. Aguarde alguns minutos.",
        };
        return { error: errorMessages[error.message] || error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: "Erro de conexão com o servidor." };
    }
  }, []);

  const signUp: AuthCtx["signUp"] = useCallback(async ({ name, email, password, role }) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        const errorMessages: Record<string, string> = {
          "User already registered": "Este e-mail já está cadastrado.",
          "Invalid email": "Formato de e-mail inválido.",
          "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres.",
          "Too many requests": "Muitas tentativas. Aguarde alguns minutos.",
        };
        return { error: errorMessages[error.message] || error.message };
      }

      // Supabase sends confirmation email automatically
      // If email confirmation is required, user needs to verify
      const needsVerification = !data.session; // No session means email confirmation required

      return { error: null, needsEmailVerification: needsVerification };
    } catch (error: any) {
      return { error: "Erro de conexão com o servidor." };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch {
      return { error: "Erro de conexão com o servidor." };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider />");
  }
  return context;
}

/** Manager-only routes */
export const MANAGER_ROUTES = ["/dashboard", "/analytics", "/supplies"] as const;

export function isManagerRoute(pathname: string) {
  return MANAGER_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}