import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { notifications as initial, type Notification } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notificações — GOODWORK" }] }),
});

const iconFor = {
  alert: AlertTriangle, warning: AlertTriangle, success: CheckCircle2, info: Info,
};
const colorFor = {
  alert: "text-destructive bg-destructive/15",
  warning: "text-warning bg-warning/15",
  success: "text-success bg-success/15",
  info: "text-primary bg-primary/15",
};

function NotificationsPage() {
  const [list, setList] = useState<Notification[]>(initial);
  const unread = list.filter((n) => !n.read).length;

  function markAll() {
    setList((l) => l.map((n) => ({ ...n, read: true })));
    toast.success("Todas marcadas como lidas");
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Central</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread} não lidas · {list.length} no total</p>
        </div>
        <button
          onClick={markAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-secondary"
        >
          <Check className="size-4" /> Marcar todas como lidas
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card gw-shadow-soft">
        <AnimatePresence>
          {list.map((n, i) => {
            const I = iconFor[n.type];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                className={`flex gap-4 border-b border-border p-4 last:border-b-0 ${!n.read ? "bg-primary/[0.03]" : ""}`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${colorFor[n.type]}`}>
                  <I className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.description}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{n.time}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="size-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Tudo em dia</p>
            <p className="text-xs text-muted-foreground">Nenhuma notificação pendente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
