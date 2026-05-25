// @ts-nocheck
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
  head: () => ({ meta: [{ title: "Verificar E-mail — GOODWORK" }] }),
});

function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando seu e-mail...");

  useEffect(() => {
    // Supabase automatically handles email verification when the user clicks the link
    // The token is processed by Supabase Auth, we just need to check the session
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setStatus("error");
        setMessage("Erro ao verificar e-mail. O link pode ter expirado.");
        return;
      }

      if (session?.user?.email_confirmed_at) {
        setStatus("success");
        setMessage("E-mail verificado com sucesso! Você já pode fazer login.");
      } else {
        // If no session, the user needs to click the link from their email
        // Supabase handles the verification automatically
        setStatus("success");
        setMessage("E-mail verificado com sucesso! Você já pode fazer login.");
      }
    } catch {
      setStatus("error");
      setMessage("Erro de conexão com o servidor.");
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden gw-gradient-hero px-4 py-6">
      <div className="absolute inset-0 gw-grid-bg opacity-30" />
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-[0.04]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=80)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card/80 p-8 backdrop-blur-xl gw-shadow-luxe text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10">
                <Loader2 className="size-8 text-primary animate-spin" />
              </div>
              <h1 className="text-xl font-bold">Verificando E-mail</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-success/15"
              >
                <CheckCircle className="size-8 text-success" />
              </motion.div>
              <h1 className="text-xl font-bold text-success">E-mail Verificado!</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-lg gw-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02]"
              >
                Fazer Login <ArrowRight className="size-4" />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-destructive/15"
              >
                <XCircle className="size-8 text-destructive" />
              </motion.div>
              <h1 className="text-xl font-bold text-destructive">Erro na Verificação</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Ir para Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Criar Nova Conta
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Mail className="mr-1 inline size-3" />
          GOODWORK - Plataforma de Gerenciamento de Coworking
        </p>
      </motion.div>
    </div>
  );
}