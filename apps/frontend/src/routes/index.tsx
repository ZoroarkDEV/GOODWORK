// @ts-nocheck
import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const nav = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    async function redirect() {
      // Wait for auth state to settle
      if (loading) return;

      // Check Supabase session directly
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        // User is logged in and email verified
        nav({ to: "/dashboard", replace: true });
      } else {
        // Not logged in or email not verified
        nav({ to: "/login", replace: true });
      }
    }

    const timer = setTimeout(redirect, 100);
    return () => clearTimeout(timer);
  }, [loading, user, nav]);

  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-primary" /> Redirecionando…
      </div>
    </div>
  );
}