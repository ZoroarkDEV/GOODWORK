import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, User as UserIcon, Mail, Lock, ArrowRight, ShieldCheck, UserRound, Check, MailCheck, ArrowLeft, Briefcase } from "lucide-react";
import { AuthShell } from "./login";
import { useAuth, type Role } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Criar conta — GOODWORK" }] }),
});

function RegisterPage() {
  const nav = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [jobTitleId, setJobTitleId] = useState("");
  const [jobTitleCustom, setJobTitleCustom] = useState("");
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [jobTitles, setJobTitles] = useState<Array<{id:string;name:string;category:string}>>([]);

  useEffect(() => {
    supabase
      .from("job_titles")
      .select("id, name, category")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (data) setJobTitles(data);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) return toast.error("Aceite os termos para continuar.");
    setLoading(true);
    const { error } = await signUp({ name, email, password, role });
    setLoading(false);
    if (error) return toast.error(error);

    // Save job_title to user profile
    const title = useCustomTitle ? jobTitleCustom : jobTitles.find((t) => t.id === jobTitleId)?.name || "";
    if (title) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from("users").update({ job_title: title }).eq("id", authUser.id);
      }
    }

    setSentTo(email);
    setEmailSent(true);
  }

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        {emailSent ? (
          <EmailVerificationCard key="verify" email={sentTo} onBack={() => setEmailSent(false)} />
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-xl sm:space-y-5 sm:p-8 gw-shadow-luxe"
          >
            {/* Brand */}
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl gw-gradient-primary gw-shadow-glow sm:size-10">
                <Sparkles className="size-4 text-primary-foreground sm:size-5" />
              </span>
              <span className="text-base font-bold tracking-tight sm:text-lg">
                GOOD<span className="text-primary">WORK</span>
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Crie sua conta</h1>
              <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                Comece grátis em segundos.
              </p>
            </div>

            {/* Role selector */}
            <div>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:text-xs">
                Como você vai usar o GOODWORK?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <RoleOption active={role === "user"} onClick={() => setRole("user")} icon={UserRound} title="Sou Membro" desc="Reservar salas." />
                <RoleOption active={role === "manager"} onClick={() => setRole("manager")} icon={ShieldCheck} title="Sou Gestor" desc="Administrar o espaço." />
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-2.5 sm:space-y-3">
              <Input icon={UserIcon} label="Nome completo" placeholder="Ana Martins" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input icon={Mail} label="E-mail" type="email" placeholder="voce@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input icon={Lock} label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Cargo</span>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={useCustomTitle ? "custom" : jobTitleId}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setUseCustomTitle(true);
                      } else {
                        setUseCustomTitle(false);
                        setJobTitleId(e.target.value);
                      }
                    }}
                    className="w-full appearance-none rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione seu cargo…</option>
                    {Object.entries(jobTitles.reduce<Record<string, Array<{id:string;name:string;category:string}>>>((acc, t) => { if (!acc[t.category]) acc[t.category] = []; acc[t.category].push(t); return acc; }, {})).map(([category, titles]) => (
                      <optgroup key={category} label={category}>
                        {titles.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">Outro (especificar)</option>
                  </select>
                </div>
                {useCustomTitle && (
                  <input
                    value={jobTitleCustom}
                    onChange={(e) => setJobTitleCustom(e.target.value)}
                    placeholder="Digite seu cargo"
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}
              </label>
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-2 text-[11px] text-muted-foreground sm:text-[12px]">
              <span
                onClick={(e) => { e.preventDefault(); setAgree((v) => !v); }}
                className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border ${agree ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface"}`}
              >
                {agree && <Check className="size-3" strokeWidth={3} />}
              </span>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="sr-only" />
              <span>
                Concordo com os{" "}
                <a className="text-primary hover:underline" href="#">Termos de uso</a> e a{" "}
                <a className="text-primary hover:underline" href="#">Política de privacidade</a>.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Criando…" : (
                <>Criar conta <ArrowRight className="size-4" /></>
              )}
            </button>

            <p className="text-center text-[11px] text-muted-foreground sm:text-xs">
              Já tem conta?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

function EmailVerificationCard({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card/80 p-6 text-center backdrop-blur-xl sm:p-8 gw-shadow-luxe"
    >
      {/* Icon */}
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 sm:size-20">
        <MailCheck className="size-8 text-primary sm:size-10" />
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Verifique seu e-mail</h2>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          Enviamos um link de confirmação para
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground break-all sm:text-base">{email}</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Clique no link do e-mail para ativar sua conta. Se não encontrar, verifique a caixa de spam.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg gw-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.01]"
          >
            Ir para o login
          </Link>
          <button
            onClick={onBack}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft className="size-4" /> Voltar ao cadastro
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RoleOption({
  active, onClick, icon: Icon, title, desc,
}: {
  active: boolean; onClick: () => void; icon: typeof ShieldCheck; title: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-2.5 text-left transition-all sm:p-3 ${
        active
          ? "border-primary/60 bg-primary/10 gw-shadow-glow"
          : "border-border bg-surface hover:bg-secondary"
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`grid size-7 place-items-center rounded-lg sm:size-8 ${
            active ? "gw-gradient-primary text-primary-foreground" : "bg-background text-muted-foreground"
          }`}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="text-xs font-semibold sm:text-sm">{title}</span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">{desc}</p>
    </button>
  );
}

function Input({
  icon: Icon, label, ...rest
}: {
  icon: typeof UserIcon; label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...rest}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}