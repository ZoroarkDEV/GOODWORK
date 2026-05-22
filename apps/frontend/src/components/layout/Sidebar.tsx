import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Package,
  BarChart3,
  Bell,
  Settings,
  Sparkles,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  managerOnly?: boolean;
};

const allNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, managerOnly: true },
  { to: "/rooms", label: "Salas", icon: DoorOpen },
  { to: "/bookings", label: "Agendamentos", icon: CalendarDays },
  { to: "/supplies", label: "Suprimentos", icon: Package, managerOnly: true },
  { to: "/analytics", label: "Analytics", icon: BarChart3, managerOnly: true },
  { to: "/notifications", label: "Notificações", icon: Bell },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ collapsed, role }: { collapsed: boolean; role: Role }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = allNav.filter((i) => !i.managerOnly || role === "manager" || role === "admin");
  const isManager = role === "manager" || role === "admin";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col",
          "transition-[width] duration-300 ease-out",
          collapsed ? "w-[76px]" : "w-[252px]",
        )}
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} nav={nav} isManager={isManager} />
      </aside>
    </>
  );
}

/** Mobile drawer — rendered at root level via SidebarMobile */
export function SidebarMobile({ open, onClose, role }: { open: boolean; onClose: () => void; role: Role }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = allNav.filter((i) => !i.managerOnly || role === "manager" || role === "admin");
  const isManager = role === "manager" || role === "admin";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar text-sidebar-foreground lg:hidden"
          >
            {/* Close button */}
            <div className="flex h-16 items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <div className="relative grid size-9 place-items-center rounded-xl gw-gradient-primary gw-shadow-glow">
                  <Sparkles className="size-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-[15px] font-bold tracking-tight">
                  GOOD<span className="text-primary">WORK</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <SidebarContent collapsed={false} pathname={pathname} nav={nav} isManager={isManager} onNavClick={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SidebarContent({
  collapsed,
  pathname,
  nav,
  isManager,
  onNavClick,
}: {
  collapsed: boolean;
  pathname: string;
  nav: NavItem[];
  isManager: boolean;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="relative grid size-9 place-items-center rounded-xl gw-gradient-primary gw-shadow-glow">
          <Sparkles className="size-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-tight">
              GOOD<span className="text-primary">WORK</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {isManager ? "Workspace Manager" : "Member Suite"}
            </span>
          </div>
        )}
      </div>

      {/* Role pill */}
      {!collapsed && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-[11px]">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-md",
              isManager ? "gw-gradient-primary text-primary-foreground" : "bg-surface text-foreground",
            )}
          >
            {isManager ? <ShieldCheck className="size-3.5" /> : <UserRound className="size-3.5" />}
          </span>
          <div className="leading-tight">
            <p className="font-semibold text-foreground">{isManager ? "Gestor" : "Membro"}</p>
            <p className="text-muted-foreground">{isManager ? "Acesso completo" : "Acesso essencial"}</p>
          </div>
        </div>
      )}

      <div className="mx-3 mb-2 h-px bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.to ||
            (item.to !== "/dashboard" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-sidebar-accent",
                active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute inset-y-1 left-0 w-[3px] rounded-full gw-gradient-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
                strokeWidth={2}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.managerOnly && (
                <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  Mgr
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer card */}
      {!collapsed && (
        <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <span className="grid size-6 place-items-center rounded-md gw-gradient-primary">
              <Sparkles className="size-3 text-primary-foreground" />
            </span>
            {isManager ? "Upgrade Enterprise" : "Vire Gestor"}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {isManager
              ? "Integrações avançadas, SSO e suporte dedicado 24/7."
              : "Acesse KPIs, analytics e gestão de suprimentos."}
          </p>
          <button className="mt-3 w-full rounded-md gw-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
            Conhecer planos
          </button>
        </div>
      )}
    </>
  );
}