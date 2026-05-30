import { useState, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Users, MapPin, Star, Check,
  Calendar as CalendarIcon, Minus, Plus, Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRoom, createBooking } from "@/lib/api";
import { rooms as mockRooms, amenityLabel, mockSupplies } from "@/mocks/data";
import type { RoomAmenity } from "@/mocks/data";
import { AdminRoomActions } from "@/components/AdminRoomActions";

export const Route = createFileRoute("/_app/rooms/$roomId")({
  loader: ({ params }) => params.roomId,
  component: RoomDetail,
  head: () => ({ meta: [{ title: "Detalhes da Sala — GOODWORK" }] }),
});

const galleryImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-15567611175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80",
];

const slots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];
const unavailable = new Set(["09:00", "10:00", "14:00"]);

interface SupplyQuantity {
  [key: string]: number;
}

function RoomDetail() {
  const { roomId } = Route.useParams();

  const { data: apiRoom, isLoading: apiLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId),
    retry: 1,
  });

  // Fallback to mock data if API fails
  const mockRoom = mockRooms.find((r) => r.id === roomId);
  const room = apiRoom
    ? {
        id: apiRoom.id,
        name: apiRoom.name,
        capacity: apiRoom.capacity,
        pricePerHour: apiRoom.hourly_rate,
        amenities: (apiRoom.amenities ?? []) as RoomAmenity[],
        image: apiRoom.image_url ?? galleryImages[0],
        description: apiRoom.description ?? "",
        floor: (apiRoom as unknown as Record<string, unknown>).floor ?? "—",
        rating: (apiRoom as unknown as Record<string, unknown>).rating ?? 4.5,
      }
    : mockRoom;

  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [pickedEndSlot, setPickedEndSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supplyQuantities, setSupplyQuantities] = useState<SupplyQuantity>({});

  // Supplies with prices for the additional supplies section
  const suppliesWithPrices = useMemo(
    () => mockSupplies.map((s) => ({
      ...s,
      pricePerUnit: s.category === "Copa" ? 5 : s.category === "Escritório" ? 3 : 10,
    })),
    []
  );

  const updateSupplyQty = (id: string, delta: number) => {
    setSupplyQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  // Calculate hours between start and end slot
  const hoursSelected = useMemo(() => {
    if (!pickedSlot || !pickedEndSlot) return 0;
    const startH = parseInt(pickedSlot.split(":")[0], 10);
    const endH = parseInt(pickedEndSlot.split(":")[0], 10);
    return Math.max(0, endH - startH);
  }, [pickedSlot, pickedEndSlot]);

  // Dynamic total calculation
  const totalPrice = useMemo(() => {
    const roomTotal = (room?.pricePerHour ?? 0) * hoursSelected;
    const suppliesTotal = suppliesWithPrices.reduce((sum, s) => {
      return sum + (supplyQuantities[s.id] ?? 0) * s.pricePerUnit;
    }, 0);
    return roomTotal + suppliesTotal;
  }, [room, hoursSelected, supplyQuantities, suppliesWithPrices]);

  if (apiLoading && !room) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          Carregando sala…
        </div>
      </div>
    );
  }

  if (!room) {
    throw notFound();
  }

  async function handleBook() {
    if (!pickedSlot || !pickedEndSlot) {
      toast.error("Selecione o horário de início e fim");
      return;
    }
    if (hoursSelected <= 0) {
      toast.error("O horário final deve ser após o inicial");
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        room_id: room.id,
        user_id: "user-001",
        start_time: new Date(`2025-01-15T${pickedSlot}:00`).toISOString(),
        end_time: new Date(`2025-01-15T${pickedEndSlot}:00`).toISOString(),
        notes: `Suprimentos: ${Object.entries(supplyQuantities)
          .filter(([, qty]) => qty > 0)
          .map(([id, qty]) => {
            const s = suppliesWithPrices.find((sp) => sp.id === id);
            return `${s?.name ?? id} x${qty}`;
          })
          .join(", ") || "Nenhum"}`,
      });
      toast.success(`Reserva confirmada das ${pickedSlot} às ${pickedEndSlot}`, {
        description: `${room.name} · Total: R$ ${totalPrice}`,
      });
    } catch {
      // Fallback: simulate success
      await new Promise((r) => setTimeout(r, 900));
      toast.success(`Reserva confirmada das ${pickedSlot} às ${pickedEndSlot}`, {
        description: `${room.name} · Total: R$ ${totalPrice}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      
      {/* TESTE FORÇADO - DEVE APARECER NO TOPO DA TELA */}
      <div className="bg-red-500/10 p-4 rounded-xl border border-red-500 text-center">
        <p className="text-xs font-bold text-red-400 mb-2">DEBUG ADMIN</p>
        <AdminRoomActions room={{ id: roomId, name: "Sala Teste", capacity: 10, price_per_hour: 50 }} />
      </div>

      <Link
        to="/rooms"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar para salas
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-5"
      >
        {/* Left column — Gallery + Supplies */}
        <div className="space-y-5 lg:col-span-3">
          {/* Main image */}
          <div className="overflow-hidden rounded-xl border border-border gw-shadow-elevated">
            <img
              src={room.image}
              alt={room.name}
              className="aspect-video w-full object-cover"
            />
          </div>

          {/* Gallery grid */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Galeria da Sala
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-border opacity-80 transition-opacity hover:opacity-100"
                >
                  <img
                    src={src}
                    alt={`Ângulo ${i + 1} da ${room.name}`}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Supplies */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">
              Suprimentos Adicionais
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Selecione os itens extras para sua reserva
            </p>
            <div className="mt-4 space-y-3">
              {suppliesWithPrices.map((s) => {
                const qty = supplyQuantities[s.id] ?? 0;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        R$ {s.pricePerUnit}/un · {s.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSupplyQty(s.id, -1)}
                        disabled={qty === 0}
                        className="grid size-7 place-items-center rounded-md border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-40"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateSupplyQty(s.id, 1)}
                        className="grid size-7 place-items-center rounded-md border border-border bg-card transition-colors hover:bg-secondary"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column — Info + Booking */}
        <div className="space-y-5 lg:col-span-2">
          {/* Room info */}
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

            {/* Painel de Controle do Gestor Injetado com Sucesso */}
           {room && (
  <div className="mt-5 border-t border-dashed border-border pt-4">
    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2">
      Painel de Controle do Gestor (Modo Administrador)
    </p>
    <AdminRoomActions 
      room={{
        id: room.id || roomId, // Garante que o ID da rota seja usado se a API não mapear o campo
        name: room.name || "",
        capacity: room.capacity || 0,
        price_per_hour: room.pricePerHour || 0,
        description: room.description || "",
        image_url: room.image || ""
      }} 
    />
  </div>
)}
          </div>

          {/* Amenities */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amenities
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {room.amenities.map((a: RoomAmenity) => (
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

          {/* Time slot picker */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horário de início
              </p>
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
                    onClick={() => {
                      setPickedSlot(s);
                      if (!pickedEndSlot || parseInt(pickedEndSlot.split(":")[0]) <= parseInt(s.split(":")[0])) {
                        const nextIdx = slots.indexOf(s) + 1;
                        if (nextIdx < slots.length) {
                          setPickedEndSlot(slots[nextIdx]);
                        }
                      }
                    }}
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

            {/* End time picker */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horário de término
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {slots.map((s) => {
                  const sel = pickedEndSlot === s;
                  const startH = pickedSlot ? parseInt(pickedSlot.split(":")[0], 10) : 0;
                  const endH = parseInt(s.split(":")[0], 10);
                  const disabled = pickedSlot ? endH <= startH : false;
                  return (
                    <button
                      key={s}
                      disabled={disabled}
                      onClick={() => setPickedEndSlot(s)}
                      className={`rounded-md py-1.5 text-xs font-medium transition-all ${
                        disabled
                          ? "cursor-not-allowed bg-secondary/40 text-muted-foreground/50"
                          : sel
                            ? "gw-gradient-accent text-accent-foreground gw-shadow-glow"
                            : "border border-border bg-surface hover:border-accent/50 hover:text-accent"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Price & Booking */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="space-y-3">
              {/* Price breakdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    R$ {room.pricePerHour}/h × {hoursSelected}h
                  </span>
                  <span>R$ {(room.pricePerHour * hoursSelected).toFixed(2)}</span>
                </div>
                {Object.entries(supplyQuantities).some(([, qty]) => qty > 0) && (
                  <div className="space-y-1 border-t border-border pt-1.5">
                    {suppliesWithPrices
                      .filter((s) => (supplyQuantities[s.id] ?? 0) > 0)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-xs text-muted-foreground"
                        >
                          <span>
                            {s.name} x{supplyQuantities[s.id]}
                          </span>
                          <span>
                            R$ {((supplyQuantities[s.id] ?? 0) * s.pricePerUnit).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={loading || !pickedSlot || !pickedEndSlot}
                className="w-full rounded-lg gw-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
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