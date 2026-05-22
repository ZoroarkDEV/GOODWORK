import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — GOODWORK" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const { signInWithPassword, signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Bem-vindo(a)!");
    nav({ to: "/rooms" });
  }

  async function google() {
    setLoading(true);
    const { error } = await signInWithOAuth("google");
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Login Google efetuado.");
    nav({ to: "/dashboard" });
  }

  return (
    <AuthShell>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card/80 p-5 sm:p-8 gw-shadow-luxe backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl gw-gradient-primary gw-shadow-glow">
            <Sparkles className="size-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">GOOD<span className="text-primary">WORK</span></span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entre na sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie seu coworking de qualquer lugar.</p>
        </div>

        <button
          type="button"
          onClick={google}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
        >
          <GoogleIcon className="size-4" /> Continuar com Google
        </button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou e-mail <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">E-mail</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>
          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Senha</span>
              <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">Esqueci minha senha</Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>
        </div>

        <button
          type="submit" disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Entrando…" : (<>Entrar <ArrowRight className="size-4" /></>)}
        </button>

         <div className="rounded-lg border border-dashed border-border bg-surface/50 p-3 text-[11px] text-muted-foreground">
           <p className="mb-1.5 font-semibold text-foreground">Dica</p>
           <p>Crie uma conta na página de registro para testar o sistema.</p>
         </div>

        <p className="text-center text-xs text-muted-foreground">
          Novo no GOODWORK? <Link to="/register" className="font-semibold text-primary hover:underline">Criar conta</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

function RoleCard({
  active, onClick, icon: Icon, title, desc,
}: { active: boolean; onClick: () => void; icon: typeof ShieldCheck; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
        active
          ? "border-primary/60 bg-primary/10 gw-shadow-glow"
          : "border-border bg-surface hover:border-border/80 hover:bg-secondary"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`grid size-8 place-items-center rounded-lg ${active ? "gw-gradient-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-semibold">{title}</span>
        {active && <span className="ml-auto size-2 rounded-full bg-primary" />}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{desc}</p>
    </button>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden gw-gradient-hero px-4 py-8 sm:p-4">
      <div className="absolute inset-0 gw-grid-bg opacity-30" />
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=80)" }}
      />
      <div className="absolute -left-32 top-1/4 size-[300px] sm:size-[400px] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-[320px] sm:size-[420px] rounded-full bg-accent/15 blur-3xl" />
      <div className="relative z-10 w-full">
        <div className="mx-auto flex max-w-md justify-center">{children}</div>
      </div>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.53-.2-2.25H12v4.26h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.07-1.9 3.25-4.72 3.25-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.18v2.85A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.83 14.09a6.6 6.6 0 0 1 0-4.18V7.06H2.18a11 11 0 0 0 0 9.88l3.65-2.85z" />
      <path fill="#EA4335" d="M12 5.27c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 1.99 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.65 2.85C6.7 7.21 9.13 5.27 12 5.27z" />
    </svg>
  );
}
