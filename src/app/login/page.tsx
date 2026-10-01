import { Logo } from "@/components/Logo";

import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { expired } = await searchParams;
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const build = commit && [commit, process.env.VERCEL_ENV].filter(Boolean).join(" · ");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={48} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AgroAI Admin</h1>
            <p className="mt-1 text-sm text-ink-2">Métricas de uso de la plataforma</p>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <LoginForm expired={expired === "1"} />
        </div>
        <p className="mt-4 text-center text-xs text-ink-3">
          Acceso solo para los emails configurados en <code>PLATFORM_ADMIN_EMAILS</code> de la API.
        </p>
        {build && <p className="mt-1 text-center font-mono text-[11px] text-ink-3">build {build}</p>}
      </div>
    </main>
  );
}
