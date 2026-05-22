import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, X, Clock, MapPin, Users } from "lucide-react";
import { bookings as initial, rooms, type Booking } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/bookings")({
  component: BookingsPage,
  head: () => ({ meta: [{ title: "Agendamentos — GOODWORK" }] }),
});

const hours = Array.from({ length: 11 }, (_, i) => 8 + i); // 08..18
const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function BookingsPage() {
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [list, setList] = useState<Booking[]>(initial);
  const [open, setOpen] = useState(false);

  async function handleCreate(data: Omit<Booking, "id" | "status" | "avatar">) {
    // Simulated API
    await new Promise((r) => setTimeout(r, 700));
    const newB: Booking = {
      ...data,
      id: `b${Date.now()}`,
      status: "confirmed",
      avatar: "VC",
    };
    setList((l) => [newB, ...l]);
    setOpen(false);
    toast.success("Reserva criada com sucesso", {
      description: `${newB.roomName} · ${newB.date} ${newB.start}–${newB.end}`,
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
          <span className="text-sm font-semibold">Semana de 18 – 24 ago</span>
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
          {/* Hours column */}
          <div className="divide-y divide-border">
            {hours.map((h) => (
              <div key={h} className="h-14 px-2 pt-1 text-right text-[10px] font-medium text-muted-foreground">
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d, di) => (
            <div key={d} className="relative divide-y divide-border">
              {hours.map((h) => {
                const busy = (di === 2 && (h === 9 || h === 14)) || (di === 4 && h === 16);
                return (
                  <div
                    key={h}
                    className={`h-14 transition-colors ${
                      busy ? "bg-secondary/40" : "hover:bg-primary/5 cursor-pointer"
                    }`}
                  />
                );
              })}
              {/* Sample event blocks */}
              {di === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-x-1 top-[56px] h-[80px] rounded-md gw-gradient-primary p-2 text-[11px] font-medium text-primary-foreground gw-shadow-glow"
                >
                  <p className="font-bold">Executive Suite</p>
                  <p className="opacity-90">09:00 – 10:30</p>
                </motion.div>
              )}
              {di === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-x-1 top-[224px] h-[56px] rounded-md bg-accent/90 p-2 text-[11px] font-medium text-accent-foreground"
                >
                  <p className="font-bold">Boardroom Arctic</p>
                  <p className="opacity-90">16:00 – 18:00</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* My bookings list */}
      <div className="rounded-xl border border-border bg-card p-5 gw-shadow-soft">
        <h2 className="mb-4 text-base font-semibold">Minhas reservas</h2>
        <ul className="divide-y divide-border">
          {list.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0">
              <span className="grid size-10 place-items-center rounded-lg gw-gradient-primary text-xs font-bold text-primary-foreground">
                {b.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{b.roomName}</p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {b.user}
                  <span>·</span>
                  <Users className="size-3" /> {b.attendees}
                </p>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                  <Clock className="size-3.5 text-muted-foreground" /> {b.date} · {b.start}–{b.end}
                </p>
                <span
                  className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    b.status === "confirmed"
                      ? "bg-success/15 text-success"
                      : b.status === "pending"
                        ? "bg-warning/15 text-warning"
                        : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <NewBookingModal open={open} onClose={() => setOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}

function NewBookingModal({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: (b: Omit<Booking, "id" | "status" | "avatar">) => Promise<void> }) {
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [attendees, setAttendees] = useState(4);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const room = rooms.find((r) => r.id === roomId)!;
    await onSubmit({
      roomId, roomName: room.name, user: "Você", date, start, end, attendees,
    });
    setLoading(false);
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
                    <option key={r.id} value={r.id}>{r.name} · até {r.capacity}p</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
                <Field label="Início"><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
                <Field label="Fim"><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
              </div>
              <Field label="Convidados">
                <Input type="number" min={1} value={attendees} onChange={(e) => setAttendees(+e.target.value)} />
              </Field>
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
