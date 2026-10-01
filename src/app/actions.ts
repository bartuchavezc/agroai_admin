"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiNotConfiguredError, TOKEN_COOKIE, apiBase, apiUrl } from "@/lib/api";

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
    });
    if (response.status === 401 || response.status === 422) return { error: "Email o contraseña incorrectos.", email };
    if (!response.ok) return { error: `La API respondió ${response.status}. Probá de nuevo en un rato.`, email };
    token = (await response.json()).access_token;

    const me = await fetch(apiUrl("/admin/me"), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
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
    console.error(`Login: could not reach the API at ${apiBase()}`, error);
    return { error: `No se pudo conectar con la API en ${apiBase()}. Revisá la URL (con https://) y que la API esté arriba.`, email };
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
