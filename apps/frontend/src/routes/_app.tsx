// @ts-nocheck
import { useState } from "react";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Sidebar, SidebarMobile } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth, isManagerRoute } from "@/lib/auth";
import { BookingConfirmationPopup } from "@/components/BookingConfirmationPopup";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    // Strict binary check: session must exist and user must be authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      // Clean redirect to login - no search params to avoid loops
      throw redirect({ to: "/login" });
    }

    // Check if email is verified
    if (!session.user.email_confirmed_at) {
      throw redirect({ to: "/verify-email" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  // Block manager-only routes for non-managers
  if (user && user.role !== "manager" && user.role !== "admin") {
    const pathname = window.location.pathname;
    if (isManagerRoute(pathname)) {
      // Redirect to rooms if trying to access manager routes
      window.location.href = "/rooms";
      return null;
    }
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar collapsed={collapsed} role={user!.role} />
      <SidebarMobile open={mobileOpen} onClose={() => setMobileOpen(false)} role={user!.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={() => setCollapsed((v) => !v)} onMobileMenu={() => setMobileOpen(true)} />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
          <BookingConfirmationPopup />
        </div>
      </div>
    </div>
  );
}