"use client";

import { useActionState } from "react";

import { login } from "../actions";

export function LoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);
  const input =
    "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink outline-none " +
    "focus:border-brand focus:ring-2 focus:ring-brand/25";
  return (
    <form action={action} className="space-y-4">
      {expired && !state?.error && (
        <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">La sesión venció. Volvé a ingresar.</p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-2">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required
          defaultValue={state?.email} className={input} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-2">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required
          className={input} />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{state.error}</p>
      )}
      <button type="submit" disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-[15px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
