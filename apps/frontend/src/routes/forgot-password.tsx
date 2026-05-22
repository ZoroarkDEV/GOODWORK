import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthShell } from "./login";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: "Recuperar senha — GOODWORK" }] }),
});

function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPasswordForEmail(email);
    setLoading(false);
    if (error) return toast.error(error);
    setSent(true);
    toast.success("E-mail enviado!");
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card/80 p-8 gw-shadow-luxe backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl gw-gradient-primary gw-shadow-glow">
            <Sparkles className="size-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">GOOD<span className="text-primary">WORK</span></span>
        </div>

        {!sent ? (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Esqueceu a senha?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Informe seu e-mail e enviaremos um link para você criar uma nova senha.
              </p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">E-mail</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@empresa.com"
                    className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>
              <button
                type="submit" disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar link de recuperação"}
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="text-xl font-bold">Verifique seu e-mail</h1>
            <p className="text-sm text-muted-foreground">
              Enviamos um link para <strong className="text-foreground">{email}</strong>. Clique para criar uma nova senha.
            </p>
          </motion.div>
        )}

        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Voltar para o login
        </Link>
      </motion.div>
    </AuthShell>
  );
}
