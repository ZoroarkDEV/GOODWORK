import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users, CalendarCheck, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, ArrowRight, Clock, MapPin,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar,
} from "recharts";
import { bookings, occupancyWeekly, supplies } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — GOODWORK" }] }),
});

const kpis = [
  { label: "Ocupação hoje", value: "82%", delta: "+12%", up: true, icon: Users, hint: "vs. semana anterior" },
  { label: "Reservas ativas", value: "47", delta: "+8", up: true, icon: CalendarCheck, hint: "23 confirmadas" },
  { label: "Receita do mês", value: "R$ 71.2k", delta: "+15.4%", up: true, icon: DollarSign, hint: "meta 65k atingida" },
  { label: "Taxa cancelamento", value: "3.1%", delta: "-0.6%", up: false, icon: TrendingDown, hint: "abaixo do alvo" },
];

import type { Variants } from "framer-motion";
const stagger: Variants = { animate: { transition: { staggerChildren: 0.06 } } };
const item: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const todaysBookings = bookings.filter((b) => b.date === today);
  const criticalSupplies = supplies.filter((s) => s.stock < s.minStock);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Visão geral</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Bom dia, Ana 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aqui está o que está acontecendo no GOODWORK HQ hoje.
          </p>
        </div>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02]"
        >
          Nova reserva <ArrowRight className="size-4" />
        </Link>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={stagger} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              variants={item}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 gw-shadow-soft transition-shadow hover:gw-shadow-elevated"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:bg-primary/10" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{k.value}</p>
                </div>
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
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
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 gw-shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Ocupação semanal</h2>
              <p className="text-xs text-muted-foreground">% de ocupação por dia · últimos 7 dias</p>
            </div>
            <div className="flex gap-1 rounded-lg border border-border bg-surface p-1 text-xs">
              {["Semana", "Mês", "Trim."].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-md px-2.5 py-1 font-medium ${
                    i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={occupancyWeekly} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="ocupacao" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#occ)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 gw-shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Reservas / dia</h2>
            <span className="text-xs text-muted-foreground">total: 103</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={occupancyWeekly} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="reservas" radius={[8, 8, 0, 0]} fill="var(--color-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's bookings */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 gw-shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Próximas reservas de hoje</h2>
              <p className="text-xs text-muted-foreground">{todaysBookings.length} agendadas</p>
            </div>
            <Link to="/bookings" className="text-xs font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {todaysBookings.map((b) => (
              <li key={b.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="grid size-10 place-items-center rounded-lg gw-gradient-primary text-xs font-bold text-primary-foreground">
                  {b.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{b.user}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {b.roomName}
                    <span className="text-border">·</span>
                    {b.attendees} pessoas
                  </p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-sm font-semibold tabular-nums">
                    <Clock className="size-3.5 text-muted-foreground" />
                    {b.start} – {b.end}
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
                    {b.status === "confirmed" ? "Confirmada" : b.status === "pending" ? "Pendente" : "Cancelada"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Critical supplies */}
        <motion.div variants={item} className="overflow-hidden rounded-xl border border-destructive/30 bg-card p-5 gw-shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-destructive/15 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Suprimentos críticos</h2>
              <p className="text-[11px] text-muted-foreground">Abaixo do estoque mínimo</p>
            </div>
          </div>
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
