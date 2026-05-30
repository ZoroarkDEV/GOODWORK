/**
 * PresenceConfirmationModal - Modal de confirmação de presença.
 * Atalho: Alt+P para abrir durante a apresentação.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Shield, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export function PresenceConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Atalho Alt+P para abrir o modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsOpen(true);
        setConfirmed(false);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    // Simula chamada à API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsConfirming(false);
    setConfirmed(true);
    toast.success("Presença confirmada com sucesso!", {
      description: "Check-in realizado às " + new Date().toLocaleTimeString("pt-BR"),
    });
    // Fecha automaticamente após 2 segundos
    setTimeout(() => setIsOpen(false), 2000);
  };

  const now = new Date();
  const currentTime = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentDate = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-accent px-6 py-5">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="size-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-white/20">
                  <Shield className="size-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Confirmação de Presença</h2>
                  <p className="text-sm text-white/80">GOODWORK HQ</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {confirmed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-success/15"
                  >
                    <CheckCircle className="size-10 text-success" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground">Presença Confirmada!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Check-in realizado com sucesso
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Info */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                      <Clock className="size-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Horário</p>
                        <p className="text-sm font-semibold">{currentTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                      <MapPin className="size-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Data</p>
                        <p className="text-sm font-semibold capitalize">{currentDate}</p>
                      </div>
                    </div>
                  </div>

                  <p className="mb-6 text-center text-sm text-muted-foreground">
                    Confirma sua presença no GOODWORK HQ agora?
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isConfirming}
                      className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60"
                    >
                      {isConfirming ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Confirmando...
                        </span>
                      ) : (
                        "Confirmar Presença"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-border bg-surface/50 px-6 py-3">
              <p className="text-center text-[10px] text-muted-foreground">
                Atalho: <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">Alt</kbd> + <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">P</kbd> para abrir durante a apresentação
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}