import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, User as UserIcon, Mail, Lock, ArrowRight, ShieldCheck, UserRound, Check } from "lucide-react";
import { AuthShell } from "./login";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Criar conta — GOODWORK" }] }),
});

function RegisterPage() {
  const nav = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) return toast.error("Aceite os termos para continuar.");
    setLoading(true);
    const { error } = await signUp({ name, email, password, role });
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Conta criada com sucesso!");
    nav({ to: role === "manager" ? "/dashboard" : "/rooms" });
  }

  return (
    <AuthShell>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card/80 p-8 gw-shadow-luxe backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl gw-gradient-primary gw-shadow-glow">
            <Sparkles className="size-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">GOOD<span className="text-primary">WORK</span></span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crie sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comece grátis em segundos.</p>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Como você vai usar o GOODWORK?
          </span>
          <div className="grid grid-cols-2 gap-2">
            <RoleOption active={role === "member"} onClick={() => setRole("member")} icon={UserRound} title="Sou Membro" desc="Vou reservar salas." />
            <RoleOption active={role === "manager"} onClick={() => setRole("manager")} icon={ShieldCheck} title="Sou Gestor" desc="Vou administrar o espaço." />
          </div>
        </div>

        <div className="space-y-3">
          <Input icon={UserIcon} label="Nome completo" placeholder="Ana Martins" value={name} onChange={(e) => setName(e.target.value)} />
          <Input icon={Mail} label="E-mail" type="email" placeholder="voce@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input icon={Lock} label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-[12px] text-muted-foreground">
          <span
            onClick={(e) => { e.preventDefault(); setAgree((v) => !v); }}
            className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border ${agree ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface"}`}
          >
            {agree && <Check className="size-3" strokeWidth={3} />}
          </span>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="sr-only" />
          <span>Concordo com os <a className="text-primary hover:underline" href="#">Termos de uso</a> e a <a className="text-primary hover:underline" href="#">Política de privacidade</a>.</span>
        </label>

        <button type="submit" disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60">
          {loading ? "Criando…" : (<>Criar conta <ArrowRight className="size-4" /></>)}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Já tem conta? <Link to="/login" className="font-semibold text-primary hover:underline">Entrar</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

function RoleOption({ active, onClick, icon: Icon, title, desc }: { active: boolean; onClick: () => void; icon: typeof ShieldCheck; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-all ${active ? "border-primary/60 bg-primary/10 gw-shadow-glow" : "border-border bg-surface hover:bg-secondary"}`}
    >
      <div className="flex items-center gap-2">
        <span className={`grid size-8 place-items-center rounded-lg ${active ? "gw-gradient-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{desc}</p>
    </button>
  );
}

function Input({ icon: Icon, label, ...rest }: { icon: typeof UserIcon; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input {...rest} className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
    </label>
  );
}
