import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Clock, MapPin, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getBookings, getRoom } from "@/lib/api";

interface UpcomingBooking {
  id: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  roomId: string;
}

export function BookingConfirmationPopup() {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [booking, setBooking] = useState<UpcomingBooking | null>(null);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Check for upcoming bookings within the next hour
    const checkBookings = async () => {
      try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        const bookings = await getBookings();
        const upcoming = bookings.filter(
          (b) =>
            b.user_id === user.id &&
            b.status === "confirmed" &&
            new Date(b.start_time) >= now &&
            new Date(b.start_time) <= oneHourFromNow
        );

        if (upcoming.length === 0) {
          setShowPopup(false);
          setBooking(null);
          return;
        }

        const b = upcoming[0];
        if (confirmed.has(b.id)) return;

        // Get room name
        let roomName = "Sala";
        try {
          const room = await getRoom(b.room_id);
          roomName = room.name;
        } catch {
          // Use default name
        }

        setBooking({
          id: b.id,
          roomName,
          startTime: new Date(b.start_time),
          endTime: new Date(b.end_time),
          roomId: b.room_id,
        });
        setShowPopup(true);
      } catch {
        setShowPopup(false);
        setBooking(null);
      }
    };

    // Check immediately and then every 30 seconds
    checkBookings();
    const interval = setInterval(checkBookings, 30000);
    return () => clearInterval(interval);
  }, [user, confirmed]);

  function handleConfirm() {
    if (!booking) return;
    setConfirmed((prev) => new Set(prev).add(booking.id));
    toast.success("Presença confirmada!");
    setShowPopup(false);
  }

  function handleDismiss() {
    if (!booking) return;
    setConfirmed((prev) => new Set(prev).add(booking.id));
    setShowPopup(false);
  }

  if (!user || !booking) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-card gw-shadow-luxe"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <CalendarCheck className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Confirmação de presença
                  </p>
                  <h3 className="text-base font-bold">Sua sala te espera!</h3>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="grid size-7 place-items-center rounded-md hover:bg-secondary transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-border bg-surface/50 p-4">
                <p className="text-lg font-bold">{booking.roomName}</p>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {booking.startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {booking.endTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {booking.startTime.toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Sua reserva começa em{" "}
                <strong className="text-foreground">
                  {Math.round((booking.startTime.getTime() - Date.now()) / 60000)} minutos
                </strong>
                . Confirme sua presença para manter a sala.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-border bg-surface/40 px-5 py-3">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                Depois
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.01]"
              >
                Confirmar presença
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}