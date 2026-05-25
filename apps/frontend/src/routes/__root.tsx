import { Outlet, Link, createRootRoute, useRouter } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          GOODWORK
        </p>
        <h1 className="mt-3 text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Esta página não existe
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado pode ter sido movido ou nunca existiu.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg gw-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground gw-shadow-glow transition-transform hover:scale-[1.02]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Algo saiu do trilho
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente em instantes. Nossa equipe já foi notificada.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-lg gw-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
