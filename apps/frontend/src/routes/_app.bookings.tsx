import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, X, Clock, MapPin, Users, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, createBooking, cancelBooking, getRooms, type ApiBooking, type ApiRoom } from "@/lib/api";

export const Route = createFileRoute("/_app/bookings")({
  component: BookingsPage,
  head: () => ({ meta: [{ title: "Agendamentos — GOODWORK" }] }),
});

const hours = Array.from({ length: 11 }, (_, i) => 8 + i);
const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function BookingsPage() {
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setOpen(false);
      toast.success("Reserva criada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao criar reserva");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Reserva cancelada");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao cancelar reserva");
    },
  });

  function handleCreate(data: { room_id: string; start_time: string; end_time: string; notes?: string }) {
    createMutation.mutate({
      ...data,
      user_id: "current-user", // TODO: get from auth context
    });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Calendário</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visualize, crie e gerencie reservas em tempo real.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02]"
        >
          <Plus className="size-4" /> Nova reserva
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <button className="grid size-8 place-items-center rounded-md border border-border bg-surface hover:bg-secondary">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold">Semana atual</span>
          <button className="grid size-8 place-items-center rounded-md border border-border bg-surface hover:bg-secondary">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1 text-xs">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 font-medium capitalize ${
                view === v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>
      </div>

      {/* Week grid */}
      <div className="overflow-hidden rounded-xl border border-border bg-card gw-shadow-soft">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] divide-x divide-border border-b border-border bg-surface/60">
          <div />
          {days.map((d, i) => (
            <div key={d} className="px-3 py-2 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
              <div className={`mt-0.5 text-sm font-bold ${i === 2 ? "text-primary" : ""}`}>{18 + i}</div>
            </div>
          ))}
        </div>
        <div className="relative grid grid-cols-[60px_repeat(7,1fr)] divide-x divide-border">
          <div className="divide-y divide-border">
            {hours.map((h) => (
              <div key={h} className="h-14 px-2 pt-1 text-right text-[10px] font-medium text-muted-foreground">
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d) => (
            <div key={d} className="relative divide-y divide-border">
              {hours.map((h) => (
                <div key={h} className="h-14 transition-colors hover:bg-primary/5 cursor-pointer" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bookings list */}
      <div className="rounded-xl border border-border bg-card p-5 gw-shadow-soft">
        <h2 className="mb-4 text-base font-semibold">Minhas reservas ({bookings.length})</h2>
        {bookingsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma reserva encontrada.</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Criar primeira reserva
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {bookings.map((b) => {
              const room = rooms.find((r) => r.id === b.room_id);
              const startDate = new Date(b.start_time);
              const endDate = new Date(b.end_time);
              return (
                <li key={b.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0">
                  <span className="grid size-10 place-items-center rounded-lg gw-gradient-primary text-xs font-bold text-primary-foreground">
                    {room?.name?.slice(0, 2).toUpperCase() || "SA"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{room?.name || "Sala"}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {startDate.toLocaleDateString("pt-BR")}
                      <span>·</span>
                      <Clock className="size-3" />
                      {startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} – {endDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      R$ {b.total_price.toFixed(2)}
                    </p>
                    <span
                      className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        b.status === "confirmed"
                          ? "bg-success/15 text-success"
                          : b.status === "pending"
                            ? "bg-warning/15 text-warning"
                            : b.status === "canceled"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {b.status === "confirmed" ? "Confirmada" : b.status === "pending" ? "Pendente" : b.status === "canceled" ? "Cancelada" : "Finalizada"}
                    </span>
                  </div>
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <button
                      onClick={() => cancelMutation.mutate(b.id)}
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      Cancelar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <NewBookingModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
        rooms={rooms}
        loading={createMutation.isPending}
      />
    </div>
  );
}

function NewBookingModal({
  open, onClose, onSubmit, rooms, loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { room_id: string; start_time: string; end_time: string; notes?: string }) => void;
  rooms: ApiRoom[];
  loading: boolean;
}) {
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const startDateTime = new Date(`${date}T${start}`);
    const endDateTime = new Date(`${date}T${end}`);
    onSubmit({
      room_id: roomId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      notes: notes || undefined,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover gw-shadow-luxe"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Nova reserva</p>
                <h3 className="text-lg font-bold">Agendar sala</h3>
              </div>
              <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-md hover:bg-secondary">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <Field label="Sala">
                <select
                  value={roomId} onChange={(e) => setRoomId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} · até {r.capacity}p · R${r.hourly_rate}/h</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today} /></Field>
                <Field label="Início"><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
                <Field label="Fim"><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
              </div>
              <Field label="Observações (opcional)">
                <textarea
                  rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Equipamentos necessários, café para os convidados…"
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/40 px-5 py-3">
              <button type="button" onClick={onClose} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary">
                Cancelar
              </button>
              <button
                type="submit" disabled={loading}
                className="rounded-lg gw-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? "Criando…" : "Confirmar reserva"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  );
}