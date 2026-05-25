import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users, CalendarCheck, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, ArrowRight, Clock, MapPin, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDashboardKpis, getRooms } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import {
  mockKpis, mockWeeklyOccupancy, mockCriticalSupplies,
  mockTodaysBookings, mockRooms,
} from "@/mocks/data";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — GOODWORK" }] }),
});

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: getDashboardKpis,
    placeholderData: { kpis: mockKpis, weeklyOccupancy: mockWeeklyOccupancy, criticalSupplies: mockCriticalSupplies, todaysBookings: mockTodaysBookings },
  });

  const { data: rooms = mockRooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
    placeholderData: mockRooms,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          Carregando dashboard…
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const weeklyOccupancy = data?.weeklyOccupancy ?? [];
  const criticalSupplies = data?.criticalSupplies ?? [];
  const todaysBookings = data?.todaysBookings ?? [];

  const kpiCards = [
    { label: "Ocupação semanal", value: `${kpis?.occupancyRate ?? 0}%`, delta: "vs. semana anterior", up: true, icon: Users, hint: `${kpis?.totalRooms ?? 0} salas ativas` },
    { label: "Reservas hoje", value: `${kpis?.todaysTotal ?? 0}`, delta: `+${kpis?.todaysConfirmed ?? 0} confirmadas`, up: true, icon: CalendarCheck, hint: `${kpis?.todaysPending ?? 0} pendentes` },
    { label: "Receita do mês", value: `R$ ${((kpis?.monthlyRevenue ?? 0) / 1000).toFixed(1)}k`, delta: "acumulado", up: true, icon: DollarSign, hint: "reservas confirmadas" },
    { label: "Taxa cancelamento", value: `${kpis?.cancellationRate ?? 0}%`, delta: "últimos 7 dias", up: false, icon: TrendingDown, hint: "meta < 5%" },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="mx-auto max-w-[1400px] space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Visão geral</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard 📊</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dados em tempo real do GOODWORK HQ.
          </p>
        </div>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 rounded-lg gw-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02] sm:px-4 sm:py-2.5"
        >
          Nova reserva <ArrowRight className="size-4" />
        </Link>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={stagger} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              variants={item}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 gw-shadow-soft transition-shadow hover:gw-shadow-elevated sm:p-5"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:bg-primary/10" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{k.value}</p>
                </div>
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary sm:size-10">
                  <Icon className="size-4 sm:size-5" />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs sm:mt-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold ${
                    k.up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {k.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {k.delta}
                </span>
                <span className="text-muted-foreground">{k.hint}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-4 gw-shadow-soft lg:col-span-2 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold sm:text-base">Ocupação semanal</h2>
              <p className="text-xs text-muted-foreground">% de ocupação por dia · últimos 7 dias</p>
            </div>
          </div>
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={weeklyOccupancy} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="ocupacao" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#occ)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-border bg-card p-4 gw-shadow-soft sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold sm:text-base">Reservas / dia</h2>
            <span className="text-xs text-muted-foreground">total: {weeklyOccupancy.reduce((a, b) => a + b.reservas, 0)}</span>
          </div>
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer>
              <BarChart data={weeklyOccupancy} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="reservas" radius={[8, 8, 0, 0]} fill="var(--color-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's bookings */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-4 gw-shadow-soft lg:col-span-2 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold sm:text-base">Próximas reservas de hoje</h2>
              <p className="text-xs text-muted-foreground">{todaysBookings.length} agendadas</p>
            </div>
            <Link to="/bookings" className="text-xs font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          {todaysBookings.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarCheck className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma reserva para hoje.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {todaysBookings.map((b) => {
                const room = rooms.find((r) => r.id === b.room_id);
                const startDate = new Date(b.start_time);
                const endDate = new Date(b.end_time);
                return (
                  <li key={b.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 sm:gap-4 sm:py-3">
                    <span className="grid size-9 place-items-center rounded-lg gw-gradient-primary text-[10px] font-bold text-primary-foreground sm:size-10">
                      {room?.name?.slice(0, 2).toUpperCase() ?? "SA"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold sm:text-sm">{room?.name ?? "Sala"}</p>
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground sm:gap-1.5 sm:text-xs">
                        <MapPin className="size-3" />
                        {room?.capacity ?? "—"} pessoas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-xs font-semibold tabular-nums sm:text-sm">
                        <Clock className="size-3 text-muted-foreground" />
                        {startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} – {endDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <span
                        className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:text-[10px] ${
                          b.status === "confirmed"
                            ? "bg-success/15 text-success"
                            : b.status === "pending"
                              ? "bg-warning/15 text-warning"
                              : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {b.status === "confirmed" ? "Confirmada" : b.status === "pending" ? "Pendente" : "Cancelada"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>

        {/* Critical supplies */}
        <motion.div variants={item} className="overflow-hidden rounded-xl border border-destructive/30 bg-card p-4 gw-shadow-soft sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-destructive/15 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Suprimentos críticos</h2>
              <p className="text-[11px] text-muted-foreground">Abaixo do estoque mínimo</p>
            </div>
          </div>
          {criticalSupplies.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-muted-foreground">Nenhum suprimento crítico no momento.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {criticalSupplies.map((s) => {
                const pct = Math.min(100, Math.round((s.stock / s.minStock) * 100));
                return (
                  <li key={s.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-medium">{s.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {s.stock}/{s.minStock} {s.unit}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full ${pct < 40 ? "bg-destructive" : "bg-warning"}`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            to="/supplies"
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-secondary"
          >
            Repor estoque <ArrowRight className="size-3.5" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}