import { useEffect, useState } from "react";
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth, isManagerRoute } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { session, loading, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Guard de autenticação (mock — equivalente a checar supabase.auth.getSession)
  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login", search: { redirect: pathname } as never, replace: true });
      return;
    }
    // Bloqueia rotas exclusivas do gestor
    if (user?.role !== "manager" && isManagerRoute(pathname)) {
      navigate({ to: "/rooms", replace: true });
    }
  }, [loading, session, user, pathname, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          Carregando sessão…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar collapsed={collapsed} role={user!.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={() => setCollapsed((v) => !v)} />
        <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
