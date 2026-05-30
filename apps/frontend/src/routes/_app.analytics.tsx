import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Download, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { mockRevenueData, mockBookingsPerDay, mockRooms } from "@/mocks/data";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — GOODWORK" }] }),
});

const periods = ["7d", "30d", "90d", "Custom"];
const roomShare = mockRooms.map((r, i) => ({ name: r.name, value: 40 - i * 5 + (i * 3) }));
const COLORS = ["var(--color-primary)", "var(--color-accent)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-warning)"];

function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [exporting, setExporting] = useState(false);

  async function exportReport() {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 900));
    setExporting(false);
    toast.success("Relatório exportado", { description: "Disponível em downloads/relatorio-ago.pdf" });
  }

  const cards = [
    { l: "Receita total", v: "R$ 459.4k", d: "+18.2%" },
    { l: "Ticket médio", v: "R$ 142", d: "+4.6%" },
    { l: "Reservas totais", v: "3.238", d: "+11.0%" },
    { l: "Cancelamento", v: "3.1%", d: "-0.7%" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Insights</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Métricas de performance e tendências do espaço.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border bg-surface p-1 text-xs">
            {periods.map((p) => (
              <button
                key={p} onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 font-medium ${period === p ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={exportReport} disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <Download className="size-4" /> {exporting ? "Gerando…" : "Exportar"}
          </button>
        </div>
      </div>

      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <motion.div
            key={c.l}
            variants={{ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }}
            className="rounded-xl border border-border bg-card p-5 gw-shadow-soft"
          >
            <p className="text-xs font-medium text-muted-foreground">{c.l}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{c.v}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-semibold text-success">
              <TrendingUp className="size-3" /> {c.d}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 gw-shadow-soft lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Receita mensal vs. meta</h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <AreaChart data={mockRevenueData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="receita" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="meta" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 gw-shadow-soft">
          <h2 className="mb-4 text-base font-semibold">Ocupação por sala</h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={roomShare} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {roomShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 gw-shadow-soft">
        <h2 className="mb-4 text-base font-semibold">Reservas por dia da semana</h2>
        <div className="h-[260px]">
          <ResponsiveContainer>
            <BarChart data={mockBookingsPerDay} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="reservas" radius={[8, 8, 0, 0]} fill="var(--color-primary)" />
              <Bar dataKey="ocupacao" radius={[8, 8, 0, 0]} fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
