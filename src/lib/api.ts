// Server-side only: the API token lives in an httpOnly cookie and never reaches the browser.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminAccount, AdminMe, AdminUser, Overview, Timeseries } from "./types";

export const TOKEN_COOKIE = "agroai_admin_token";

export function apiUrl(path: string): string {
  const base = process.env.AGROAI_API_URL;
  if (!base) throw new Error("AGROAI_API_URL is not set");
  return `${base.replace(/\/+$/, "")}/api/v1${path}`;
}

/** GET an /admin endpoint with the session token. No session, an expired token or a non-admin user → /login. */
async function adminGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) redirect("/login");
  const response = await fetch(apiUrl(`/admin${path}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
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
