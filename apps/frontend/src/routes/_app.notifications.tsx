import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, AlertTriangle, Info, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getNotifications, markNotificationRead, type ApiNotification } from "@/lib/api";
import { mockNotifications } from "@/mocks/data";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notificações — GOODWORK" }] }),
});

const iconFor: Record<string, typeof Bell> = {
  alert: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
  booking: CheckCircle2,
  general: Bell,
};

const colorFor: Record<string, string> = {
  alert: "text-destructive bg-destructive/15",
  warning: "text-warning bg-warning/15",
  success: "text-success bg-success/15",
  info: "text-primary bg-primary/15",
  booking: "text-success bg-success/15",
  general: "text-muted-foreground bg-secondary",
};

function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = mockNotifications as any[], isLoading, error } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => getNotifications(user!.id),
    enabled: !!user,
    placeholderData: mockNotifications,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter((n: ApiNotification) => !n.read);
      for (const n of unread) {
        await markNotificationRead(n.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      toast.success("Todas marcadas como lidas");
    },
  });

  const unread = notifications.filter((n: ApiNotification) => !n.read).length;

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHr < 24) return `há ${diffHr}h`;
    if (diffDay < 7) return `há ${diffDay}d`;
    return date.toLocaleDateString("pt-BR");
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          Carregando notificações…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <p className="text-sm text-destructive">Erro ao carregar notificações.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Central</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Notificações</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread} não lidas · {notifications.length} no total</p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            <Check className="size-4" /> Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card gw-shadow-soft">
        <AnimatePresence>
          {notifications.map((n: ApiNotification, i: number) => {
            const I = iconFor[n.type] || Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !n.read && markAsRead.mutate(n.id)}
                className={`flex cursor-pointer gap-3 border-b border-border p-3 last:border-b-0 transition-colors hover:bg-surface/50 sm:gap-4 sm:p-4 ${!n.read ? "bg-primary/[0.03]" : ""}`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg sm:size-10 ${colorFor[n.type] || "text-muted-foreground bg-secondary"}`}>
                  <I className="size-4 sm:size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{n.title}</p>
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{n.message}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{formatTime(n.created_at)}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {notifications.length === 0 && (
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