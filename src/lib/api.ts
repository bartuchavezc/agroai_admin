// Server-side only: the API token lives in an httpOnly cookie and never reaches the browser.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminAccount, AdminMe, AdminUser, Overview, Timeseries } from "./types";

export const TOKEN_COOKIE = "agroai_admin_token";

export class ApiNotConfiguredError extends Error {
  constructor() {
    super("AGROAI_API_URL (or NEXT_PUBLIC_API_URL) is not set");
  }
}

/** The API base URL, with or without /api/v1 (web-monitoring's NEXT_PUBLIC_API_URL includes it). */
export function apiBase(): string {
  const base = process.env.AGROAI_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new ApiNotConfiguredError();
  return base.trim().replace(/\/+$/, "").replace(/\/api\/v1$/, "");
}

export function apiUrl(path: string): string {
  return `${apiBase()}/api/v1${path}`;
}

/** Every call to the API gives up after this long instead of hanging the page. */
export const API_TIMEOUT_MS = 10_000;

const FETCH_ERRORS: Record<string, string> = {
  ENOTFOUND: "el dominio no existe (DNS)",
  EAI_AGAIN: "no se pudo resolver el dominio (DNS)",
  ECONNREFUSED: "conexión rechazada: la API no está escuchando en esa dirección/puerto",
  ECONNRESET: "la conexión se cortó",
  UND_ERR_CONNECT_TIMEOUT: "no respondió a tiempo (¿firewall o IP bloqueada?)",
  UND_ERR_SOCKET: "la conexión se cortó",
  ERR_INVALID_URL: "la URL no es válida (¿le falta https://?)",
  CERT_HAS_EXPIRED: "el certificado HTTPS venció",
  ERR_TLS_CERT_ALTNAME_INVALID: "el certificado HTTPS no corresponde a ese dominio",
  DEPTH_ZERO_SELF_SIGNED_CERT: "el certificado HTTPS no es válido (autofirmado)",
  SELF_SIGNED_CERT_IN_CHAIN: "el certificado HTTPS no es válido (autofirmado)",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "el certificado HTTPS no es válido",
};

/** Why a fetch to the API threw, in words the admin can act on (undici hides the reason in `cause`). */
export function describeFetchError(error: unknown): string {
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return `no respondió en ${API_TIMEOUT_MS / 1000} s`;
  }
  const cause = (error as { cause?: { code?: string; message?: string } } | null)?.cause;
  const code = cause?.code ?? (error as { code?: string } | null)?.code;
  if (code && FETCH_ERRORS[code]) return `${FETCH_ERRORS[code]} [${code}]`;
  return [code, cause?.message ?? (error instanceof Error ? error.message : String(error))].filter(Boolean).join(": ");
}

/** GET an /admin endpoint with the session token. No session, an expired token or a non-admin user → /login. */
async function adminGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) redirect("/login");
  const response = await fetch(apiUrl(`/admin${path}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (response.status === 401 || response.status === 404) redirect("/login?expired=1");
  if (!response.ok) throw new Error(`API ${path} answered ${response.status}`);
  return (await response.json()) as T;
}

export const getMe = () => adminGet<AdminMe>("/me");
export const getOverview = (days: number) => adminGet<Overview>(`/overview?days=${days}`);
export const getTimeseries = (days: number) => adminGet<Timeseries>(`/timeseries?days=${days}`);
export const getUsers = () => adminGet<AdminUser[]>("/users");
export const getAccounts = () => adminGet<AdminAccount[]>("/accounts");
