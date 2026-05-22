import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, Menu, LogOut, User, Settings as SettingsIcon, ShieldCheck, UserRound, ArrowLeftRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { notifications } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const { user, signOut, switchRole } = useAuth();
  const navigate = useNavigate();

  const isManager = user?.role === "manager";

  async function handleLogout() {
    await signOut();
    toast.success("Sessão encerrada.");
    navigate({ to: "/login", replace: true });
  }

  function handleSwitchRole() {
    const next = isManager ? "member" : "manager";
    switchRole(next);
    toast.message(`Modo ${next === "manager" ? "Gestor" : "Membro"} ativado`, {
      description: "Demo: alternância rápida entre perfis.",
    });
    setOpenUser(false);
    if (next === "member") navigate({ to: "/rooms" });
    else navigate({ to: "/dashboard" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border gw-glass">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button
          onClick={onToggleSidebar}
          aria-label="Alternar menu lateral"
          className="grid size-9 place-items-center rounded-lg border border-border bg-surface hover:bg-secondary transition-colors"
        >
          <Menu className="size-4" />
        </button>

        {/* Global search */}
        <div className="relative ml-1 hidden flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder={isManager ? "Buscar salas, reservas, pessoas…" : "Buscar salas disponíveis…"}
            className="w-full rounded-lg border border-border bg-surface/60 py-2.5 pl-10 pr-12 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Role badge */}
          <span
            className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider md:inline-flex ${
              isManager
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-surface text-muted-foreground"
            }`}
          >
            {isManager ? <ShieldCheck className="size-3" /> : <UserRound className="size-3" />}
            {isManager ? "Gestor" : "Membro"}
          </span>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setOpenNotif((v) => !v); setOpenUser(false); }}
              aria-label="Notificações"
              className="relative grid size-9 place-items-center rounded-lg border border-border bg-surface hover:bg-secondary transition-colors"
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground gw-shadow-soft">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {openNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-xl border border-border bg-popover gw-shadow-luxe"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-sm font-semibold">Notificações</h3>
                    <Link to="/notifications" className="text-xs text-primary hover:underline" onClick={() => setOpenNotif(false)}>
                      Ver todas
                    </Link>
                  </div>
                  <ul className="max-h-[360px] divide-y divide-border overflow-auto">
                    {notifications.slice(0, 4).map((n, i) => (
                      <motion.li
                        key={n.id}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex gap-3 px-4 py-3 hover:bg-secondary/60"
                      >
                        <span
                          className={`mt-1 size-2 shrink-0 rounded-full ${
                            n.type === "alert" ? "bg-destructive"
                              : n.type === "warning" ? "bg-warning"
                              : n.type === "success" ? "bg-success"
                              : "bg-primary"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{n.title}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">{n.description}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{n.time}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => { setOpenUser((v) => !v); setOpenNotif(false); }}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 hover:bg-secondary transition-colors"
            >
              <span className="grid size-7 place-items-center rounded-md gw-gradient-primary text-xs font-bold text-primary-foreground">
                {user?.avatarInitials ?? "GW"}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-xs font-semibold">{user?.name ?? "Convidado"}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {isManager ? "Gestor" : "Membro"} · {user?.company ?? "GOODWORK"}
                </span>
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>

            <AnimatePresence>
              {openUser && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-border bg-popover p-1.5 gw-shadow-luxe"
                >
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link to="/settings" onClick={() => setOpenUser(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                    <User className="size-4 text-muted-foreground" /> Perfil
                  </Link>
                  <Link to="/settings" onClick={() => setOpenUser(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                    <SettingsIcon className="size-4 text-muted-foreground" /> Configurações
                  </Link>
                  <button
                    onClick={handleSwitchRole}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary"
                  >
                    <ArrowLeftRight className="size-4 text-muted-foreground" />
                    Trocar para {isManager ? "Membro" : "Gestor"}
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" /> Sair
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
