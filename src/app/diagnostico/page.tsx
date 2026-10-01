import { lookup } from "node:dns/promises";

import type { Metadata } from "next";
import { connection } from "next/server";

import { Logo } from "@/components/Logo";
import { API_TIMEOUT_MS, apiBase, apiUrlSource, describeFetchError } from "@/lib/api";

export const metadata: Metadata = { title: "Diagnóstico · AgroAI Admin" };

type Check = { name: string; ok: boolean; detail: string };

async function probe(name: string, url: string, init: RequestInit, expect: (status: number) => string | null): Promise<Check> {
  const started = Date.now();
  try {
    const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(API_TIMEOUT_MS) });
    const ms = Date.now() - started;
    const problem = expect(response.status);
    return { name, ok: !problem, detail: `HTTP ${response.status} en ${ms} ms${problem ? ` — ${problem}` : ""}` };
  } catch (error) {
    return { name, ok: false, detail: `${describeFetchError(error)} (${Date.now() - started} ms)` };
  }
}

/** What the panel's server sees when it calls the API. Public on purpose (no session needed to debug the login);
 * it only shows the API URL, which is public anyway, and response codes. */
export default async function DiagnosticPage() {
  await connection();
  const source = apiUrlSource();
  const checks: Check[] = [];
  let base: string | null = null;

  if (!source) {
    checks.push({ name: "Variable de entorno", ok: false, detail: "Ni AGROAI_API_URL ni NEXT_PUBLIC_API_URL están definidas en este deploy." });
  } else {
    base = apiBase();
    checks.push({ name: "Variable de entorno", ok: true, detail: `${source.name} = ${source.value}` });
    let host: string | null = null;
    try {
      host = new URL(base).hostname;
      checks.push({ name: "URL", ok: true, detail: `base ${base} (host ${host})` });
    } catch {
      checks.push({ name: "URL", ok: false, detail: `"${base}" no es una URL válida (¿le falta https://?)` });
    }
    if (host) {
      try {
        const addresses = await lookup(host, { all: true });
        checks.push({ name: "DNS", ok: true, detail: addresses.map((a) => a.address).join(", ") });
      } catch (error) {
        checks.push({ name: "DNS", ok: false, detail: describeFetchError({ cause: error }) });
      }
      checks.push(await probe("GET /health", `${base}/health`, {}, (s) => (s === 200 ? null : "se esperaba 200")));
      checks.push(
        await probe(
          "POST /api/v1/auth/login (vacío)",
          `${base}/api/v1/auth/login`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
          (s) => (s === 422 ? null : s === 404 ? "no es la API (¿URL de la web?)" : "se esperaba 422"),
        ),
      );
      checks.push(
        await probe("GET /api/v1/admin/me (sin token)", `${base}/api/v1/admin/me`, {}, (s) =>
          s === 401 ? null : s === 404 ? "la API desplegada todavía no tiene las rutas /admin" : "se esperaba 401",
        ),
      );
    }
  }

  const env = process.env;
  const build = [env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7), env.VERCEL_ENV, env.VERCEL_REGION, `node ${process.version}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Logo size={36} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Diagnóstico de conexión</h1>
          <p className="text-sm text-ink-2">Lo que ve el servidor del panel al llamar a la API.</p>
        </div>
      </div>
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {checks.map((c) => (
          <li key={c.name} className="flex gap-3 px-4 py-3 text-sm">
            <span aria-label={c.ok ? "ok" : "error"} className={`mt-0.5 font-semibold ${c.ok ? "text-good" : "text-bad"}`}>
              {c.ok ? "✓" : "✗"}
            </span>
            <div className="min-w-0">
              <div className="font-medium">{c.name}</div>
              <div className="break-words font-mono text-xs text-ink-2">{c.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-xs text-ink-3">{build}</p>
    </main>
  );
}
