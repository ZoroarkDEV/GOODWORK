import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Plus, Package as PackageIcon, ArrowDownUp, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supplies as initial, consumptionTrend, type Supply } from "@/mocks/data";

export const Route = createFileRoute("/_app/supplies")({
  component: SuppliesPage,
  head: () => ({ meta: [{ title: "Suprimentos — GOODWORK" }] }),
});

function SuppliesPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Supply[]>(initial);

  const filtered = items.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  const critical = items.filter((s) => s.stock < s.minStock);

  async function move(id: string, type: "in" | "out") {
    await new Promise((r) => setTimeout(r, 500));
    setItems((arr) =>
      arr.map((s) => (s.id === id ? { ...s, stock: Math.max(0, s.stock + (type === "in" ? 20 : -5)) } : s)),
    );
    toast.success(type === "in" ? "Entrada registrada" : "Saída registrada", { description: "Histórico atualizado" });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Estoque</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Suprimentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} itens · {critical.length} críticos</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02]">
          <Plus className="size-4" /> Novo item
        </button>
      </div>

      {/* Critical cards */}
      {critical.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {critical.map((s) => {
            const pct = Math.min(100, Math.round((s.stock / s.minStock) * 100));
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/30 bg-card p-4 gw-shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-lg bg-destructive/15 text-destructive">
                      <AlertTriangle className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.category}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                    Crítico
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Estoque</span>
                  <span className="tabular-nums font-semibold">{s.stock}/{s.minStock} {s.unit}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }}
                    className={`h-full rounded-full ${pct < 40 ? "bg-destructive" : "bg-warning"}`}
                  />
                </div>
                <button
                  onClick={() => move(s.id, "in")}
                  className="mt-3 w-full rounded-md gw-gradient-primary py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Repor estoque
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5 gw-shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Consumo ao longo do tempo</h2>
            <p className="text-xs text-muted-foreground">Últimas 6 semanas</p>
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer>
            <LineChart data={consumptionTrend} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="café" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="papel" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="água" stroke="var(--color-warning)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card gw-shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar item…"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} resultados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Última movimentação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s, i) => {
                const pct = Math.min(100, Math.round((s.stock / s.minStock) * 100));
                const crit = s.stock < s.minStock;
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                          <PackageIcon className="size-4" />
                        </span>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-20 tabular-nums">{s.stock} {s.unit}</span>
                        <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-secondary md:block">
                          <div className={`h-full ${crit ? (pct < 40 ? "bg-destructive" : "bg-warning") : "bg-success"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        crit ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                      }`}>
                        {crit ? "Crítico" : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.lastMovement}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => move(s.id, "in")} className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium hover:border-success/50 hover:text-success">
                          +Entrada
                        </button>
                        <button onClick={() => move(s.id, "out")} className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium hover:border-destructive/50 hover:text-destructive">
                          <ArrowDownUp className="inline size-3" /> Saída
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
