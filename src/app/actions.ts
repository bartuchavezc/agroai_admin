"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import {
  API_TIMEOUT_MS,
  ApiNotConfiguredError,
  TOKEN_COOKIE,
  adminWrite,
  apiBase,
  apiUrl,
  describeFetchError,
} from "@/lib/api";

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

export type CreateOwnerState = { error?: string; created?: string; values?: Record<string, string> } | undefined;

const OWNER_FIELDS = ["email", "password", "first_name", "last_name", "account_name", "country"] as const;

/** A new account and its owner. The API checks the caller is a platform admin (anyone else gets a 404). */
export async function createOwner(_: CreateOwnerState, formData: FormData): Promise<CreateOwnerState> {
  const values = Object.fromEntries(OWNER_FIELDS.map((k) => [k, String(formData.get(k) ?? "").trim()]));
  const keep = { ...values, password: "" }; // echoed back to refill the form, never the password
  if (!values.email || !values.password) return { error: "Completá email y contraseña.", values: keep };
  if (values.password.length < 8) return { error: "La contraseña tiene que tener al menos 8 caracteres.", values: keep };

  const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v));
  let result;
  try {
    result = await adminWrite("POST", "/users", body);
  } catch (error) {
    unstable_rethrow(error); // the redirect to /login when the session expired
    return { error: `No se pudo conectar con la API: ${describeFetchError(error)}.`, values: keep };
  }
  if (!result.ok) {
    const error =
      result.status === 409 ? "Ya existe un usuario con ese email."
      : result.status === 404 ? "La API no permite crear usuarios desde el panel (¿versión vieja de la API?)."
      : result.status === 422 ? `Datos inválidos${result.detail ? `: ${result.detail}` : "."}`
      : `La API respondió ${result.status}${result.detail ? `: ${result.detail}` : "."}`;
    return { error, values: keep };
  }
  refresh();
  return { created: values.email };
}

/** Enable or disable a user (any account). Disabling closes their open sessions. */
export async function setUserActive(userId: string, active: boolean): Promise<{ error?: string }> {
  let result;
  try {
    result = await adminWrite("PATCH", `/users/${encodeURIComponent(userId)}`, { is_active: active });
  } catch (error) {
    unstable_rethrow(error);
    return { error: `No se pudo conectar con la API: ${describeFetchError(error)}.` };
  }
  if (!result.ok) {
    return { error: result.status === 400 ? "No podés deshabilitarte a vos mismo." : `La API respondió ${result.status}.` };
  }
  refresh();
  return {};
}
