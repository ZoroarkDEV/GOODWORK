import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Users, MapPin, Wifi, Monitor, PencilRuler, Coffee, Wind, Phone, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRooms, type ApiRoom } from "@/lib/api";

export const Route = createFileRoute("/_app/rooms")({
  component: RoomsPage,
  head: () => ({ meta: [{ title: "Salas — GOODWORK" }] }),
});

const amenityIcon: Record<string, typeof Wifi> = {
  wifi: Wifi, screen: Monitor, whiteboard: PencilRuler, coffee: Coffee, ac: Wind, phone: Phone, videoconf: Video,
  tv: Monitor, videoconferencia: Video,
};

const amenityLabel: Record<string, string> = {
  wifi: "Wi-Fi de alta velocidade",
  screen: "Tela 4K",
  whiteboard: "Quadro branco",
  coffee: "Café & água",
  ac: "Climatização",
  phone: "Telefone",
  videoconf: "Videoconferência",
  tv: "TV",
  videoconferencia: "Videoconferência",
  quadro: "Quadro branco",
  cafeteira: "Café & água",
};

const capacityFilters = [
  { label: "Todas", min: 0 },
  { label: "Até 4", min: 0, max: 4 },
  { label: "5–10", min: 5, max: 10 },
  { label: "11+", min: 11 },
];

function RoomsPage() {
  const [q, setQ] = useState("");
  const [cap, setCap] = useState(0);

  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const filtered = rooms.filter((r) => {
    const m = q ? r.name.toLowerCase().includes(q.toLowerCase()) : true;
    const f = capacityFilters[cap];
    const cmin = f.min;
    const cmax = f.max ?? 999;
    return m && r.capacity >= cmin && r.capacity <= cmax;
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Espaços</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Salas disponíveis</h1>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Espaços</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Salas disponíveis</h1>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center">
          <p className="text-sm text-destructive">Erro ao carregar salas: {(error as Error).message}</p>
          <p className="mt-2 text-xs text-muted-foreground">Verifique se o backend está rodando em http://localhost:3000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Espaços</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Salas disponíveis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {rooms.length} salas correspondem aos seus filtros.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 gw-shadow-soft sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar sala por nome…"
            className="w-full rounded-lg border border-border bg-surface/60 py-2 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1 text-xs">
          {capacityFilters.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setCap(i)}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                cap === i ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        {filtered.map((r) => (
          <motion.article
            key={r.id}
            variants={{
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
            } as const}
            whileHover={{ y: -4 }}
            className="group overflow-hidden rounded-xl border border-border bg-card gw-shadow-soft transition-shadow hover:gw-shadow-luxe"
          >
            <Link to="/rooms/$roomId" params={{ roomId: r.id }}>
              <div className="relative aspect-video overflow-hidden bg-surface">
                {r.image_url ? (
                  <img
                    src={r.image_url}
                    alt={r.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Monitor className="size-12 opacity-30" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute right-3 top-3 rounded-md bg-primary/90 px-2 py-1 text-[11px] font-bold text-primary-foreground backdrop-blur">
                  R$ {r.hourly_rate}/h
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                  <h3 className="text-lg font-bold drop-shadow">{r.name}</h3>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {r.description || "Sala disponível para reserva."}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Users className="size-3.5 text-primary" />
                    Até {r.capacity} pessoas
                  </div>
                  <div className="flex -space-x-1">
                    {(r.amenities || []).slice(0, 4).map((a) => {
                      const I = amenityIcon[a] || Wifi;
                      return (
                        <span
                          key={a}
                          className="grid size-6 place-items-center rounded-full border border-border bg-surface text-muted-foreground"
                          title={amenityLabel[a] || a}
                        >
                          <I className="size-3" />
                        </span>
                      );
                    })}
                    {(r.amenities || []).length > 4 && (
                      <span className="grid size-6 place-items-center rounded-full border border-border bg-surface text-[9px] font-bold">
                        +{(r.amenities || []).length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma sala encontrada com os filtros atuais.</p>
        </div>
      )}
    </div>
  );
}