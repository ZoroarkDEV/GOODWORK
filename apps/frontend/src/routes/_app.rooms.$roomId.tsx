import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Users, MapPin, Star, Check, Calendar as CalendarIcon } from "lucide-react";
import { rooms, amenityLabel } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/rooms/$roomId")({
  loader: ({ params }) => {
    const room = rooms.find((r) => r.id === params.roomId);
    if (!room) throw notFound();
    return room as (typeof rooms)[number];
  },
  component: RoomDetail,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Sala"} — GOODWORK` }],
  }),
});

const slots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const unavailable = new Set(["09:00", "10:00", "14:00"]);

function RoomDetail() {
  const room = Route.useLoaderData();
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBook() {
    if (!pickedSlot) {
      toast.error("Selecione um horário disponível");
      return;
    }
    setLoading(true);
    // Simulated API call
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success(`Reserva confirmada às ${pickedSlot}`, {
      description: `${room.name} · ${room.floor}`,
    });
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Link to="/rooms" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar para salas
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          <div className="overflow-hidden rounded-xl border border-border gw-shadow-elevated">
            <img src={room.image} alt={room.name} className="aspect-video w-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[room.image, room.image, room.image].map((src, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border opacity-80 hover:opacity-100 transition-opacity">
                <img src={src} alt="" className="aspect-video w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> {room.floor}
              <span>·</span>
              <Star className="size-3.5 fill-warning text-warning" /> {room.rating}
              <span>·</span>
              <Users className="size-3.5" /> {room.capacity} pessoas
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{room.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amenities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {room.amenities.map((a: import("@/lib/mock-data").RoomAmenity) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium"
                >
                  <Check className="size-3 text-primary" />
                  {amenityLabel(a)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disponibilidade hoje</p>
              <CalendarIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {slots.map((s) => {
                const taken = unavailable.has(s);
                const sel = pickedSlot === s;
                return (
                  <button
                    key={s}
                    disabled={taken}
                    onClick={() => setPickedSlot(s)}
                    className={`rounded-md py-1.5 text-xs font-medium transition-all ${
                      taken
                        ? "cursor-not-allowed bg-secondary/40 text-muted-foreground line-through"
                        : sel
                          ? "gw-gradient-primary text-primary-foreground gw-shadow-glow"
                          : "border border-border bg-surface hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">R$ {room.pricePerHour}<span className="text-sm font-normal text-muted-foreground">/hora</span></p>
              </div>
              <button
                onClick={handleBook}
                disabled={loading}
                className="rounded-lg gw-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? "Confirmando…" : "Agendar agora"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
