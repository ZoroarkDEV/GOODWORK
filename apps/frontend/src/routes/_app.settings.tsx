import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sun, Moon, Bell, Mail, Globe, Loader2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { getJobTitles, updateUserProfile, type ApiJobTitle } from "@/lib/api";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Configurações — GOODWORK" }] }),
});

function SettingsPage() {
  const { user } = useAuth();
  const [dark, setDark] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitleId, setJobTitleId] = useState("");
  const [jobTitleCustom, setJobTitleCustom] = useState("");
  const [useCustomTitle, setUseCustomTitle] = useState(false);

  const { data: jobTitles = [], isLoading: titlesLoading } = useQuery({
    queryKey: ["job-titles"],
    queryFn: () => getJobTitles(),
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggleTheme(v: boolean) {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const title = useCustomTitle ? jobTitleCustom : jobTitles.find((t) => t.id === jobTitleId)?.name || "";

      await updateUserProfile(user.id, {
        name,
        job_title: title,
      });

      toast.success("Preferências salvas!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const groupedTitles = jobTitles.reduce<Record<string, ApiJobTitle[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-[900px] space-y-4 sm:space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Conta</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Perfil & Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalize sua experiência no GOODWORK.</p>
      </div>

      {/* Profile card */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 gw-shadow-soft sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full gw-gradient-primary text-lg font-bold text-primary-foreground gw-shadow-glow sm:size-16">
            {initials || "U"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold sm:text-lg">{name || "Usuário"}</h2>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{email}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nome">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </Field>
          <Field label="E-mail">
            <input value={email} disabled className="w-full rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-muted-foreground" />
          </Field>
          <Field label="Cargo">
            {titlesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Carregando cargos…
              </div>
            ) : (
              <>
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
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione um cargo…</option>
                  {Object.entries(groupedTitles).map(([category, titles]) => (
                    <optgroup key={category} label={category}>
                      {titles.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="custom">Outro (especificar)</option>
                </select>
                {useCustomTitle && (
                  <input
                    value={jobTitleCustom}
                    onChange={(e) => setJobTitleCustom(e.target.value)}
                    placeholder="Digite seu cargo"
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}
              </>
            )}
          </Field>
          <Field label="Idioma">
            <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Português (BR)</option>
              <option>English (US)</option>
              <option>Español</option>
            </select>
          </Field>
        </div>
      </motion.section>

      {/* Preferences */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5 gw-shadow-soft sm:p-6">
        <h2 className="text-base font-semibold">Preferências</h2>
        <div className="mt-4 space-y-3">
          <Toggle icon={dark ? Moon : Sun} title="Modo escuro" hint="Use a estética premium escura padrão da plataforma." checked={dark} onChange={toggleTheme} />
          <Toggle icon={Mail} title="Notificações por e-mail" hint="Resumo diário e alertas críticos." checked={emailNotif} onChange={setEmailNotif} />
          <Toggle icon={Bell} title="Notificações push" hint="Reservas em tempo real e lembretes." checked={pushNotif} onChange={setPushNotif} />
          <Toggle icon={Globe} title="Mostrar fuso horário no calendário" hint="Útil para times distribuídos." checked={true} onChange={() => {}} />
        </div>
      </motion.section>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg gw-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ icon: Icon, title, hint, checked, onChange }: {
  icon: typeof Sun; title: string; hint: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <button
        role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "gw-gradient-primary" : "bg-secondary"}`}
      >
        <motion.span
          layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 size-5 rounded-full bg-white gw-shadow-soft ${checked ? "right-0.5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}