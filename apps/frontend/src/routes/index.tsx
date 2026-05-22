import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const nav = useNavigate();
  const { loading, session, user } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      nav({ to: "/login", replace: true });
    } else {
      nav({ to: user?.role === "manager" ? "/dashboard" : "/rooms", replace: true });
    }
  }, [loading, session, user, nav]);

  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-primary" /> Redirecionando…
      </div>
    </div>
  );
}
