"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_TIMEOUT_MS, ApiNotConfiguredError, TOKEN_COOKIE, apiBase, apiUrl, describeFetchError } from "@/lib/api";

export type LoginState = { error?: string; email?: string } | undefined;

// Matches the API's AUTH_TOKEN_EXPIRE_MINUTES default (24 h); an expired token just sends you back to /login.
const SESSION_SECONDS = 60 * 60 * 24;

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Completá email y contraseña.", email };

  let token: string;
  try {
    const response = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (response.status === 401 || response.status === 422) return { error: "Email o contraseña incorrectos.", email };
    if (!response.ok) {
      const hint = response.status === 404 || response.status === 405 ? " ¿Es la URL de la API (no la de la web)?" : "";
      return { error: `${apiBase()} respondió ${response.status} al login.${hint}`, email };
    }
    token = (await response.json()).access_token;

    const me = await fetch(apiUrl("/admin/me"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!me.ok) {
      // 404 also when the deployed API predates the /admin routes.
      return {
        error: "Este usuario no es administrador de la plataforma (revisá PLATFORM_ADMIN_EMAILS y la versión de la API).",
        email,
      };
    }
  } catch (error) {
    if (error instanceof ApiNotConfiguredError) {
      return { error: "Falta configurar AGROAI_API_URL en el servidor del panel.", email };
    }
    const reason = describeFetchError(error);
    console.error(`Login: could not reach the API at ${apiBase()}: ${reason}`, error);
    return { error: `No se pudo conectar con la API en ${apiBase()}: ${reason}.`, email };
  }

  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/login");
}
