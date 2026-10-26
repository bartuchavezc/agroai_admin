"use client";

import { type ComponentProps, useState, useTransition } from "react";

import { type CreateOwnerState, createOwner } from "@/app/actions";

const COUNTRIES = [
  { code: "AR", name: "Argentina" },
  { code: "MX", name: "México" },
  { code: "CO", name: "Colombia" },
];

const input =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none " +
  "focus:border-brand focus:ring-2 focus:ring-brand/25";

/** Adds an owner with a new account; the owner then adds their own members from the app. */
export function NewOwnerForm() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CreateOwnerState>();
  const [pending, startTransition] = useTransition();
  const v = state?.values ?? {};

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => { setState(undefined); setOpen(true); }}
          className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90">
          Nuevo owner
        </button>
        {state?.created && (
          <p role="status" className="text-sm text-good">Se creó {state.created} con su cuenta.</p>
        )}
      </div>
    );
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await createOwner(undefined, formData);
          setState(result);
          if (result?.created) setOpen(false);
        })
      }
      className="space-y-4 rounded-xl border border-line bg-surface p-4 sm:p-5"
    >
      <div>
        <h2 className="text-sm font-semibold">Nuevo owner</h2>
        <p className="mt-0.5 text-xs text-ink-3">
          Crea una cuenta nueva con este usuario como owner. Pasale el email y la contraseña; después suma a su equipo desde la app.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required defaultValue={v.email} autoComplete="off" />
        <Field label="Contraseña inicial" name="password" type="password" required minLength={8} autoComplete="new-password"
          hint="Mínimo 8 caracteres." />
        <Field label="Nombre" name="first_name" defaultValue={v.first_name} />
        <Field label="Apellido" name="last_name" defaultValue={v.last_name} />
        <Field label="Nombre de la cuenta" name="account_name" defaultValue={v.account_name}
          hint="Opcional: si no, se usa el nombre y apellido." />
        <div className="space-y-1.5">
          <label htmlFor="country" className="text-xs font-medium text-ink-2">País</label>
          <select id="country" name="country" defaultValue={v.country || "AR"} className={input}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {pending ? "Creando…" : "Crear owner"}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="rounded-lg border border-line px-3.5 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, hint, ...props }: { label: string; name: string; hint?: string } & ComponentProps<"input">) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs font-medium text-ink-2">{label}</label>
      <input id={name} name={name} className={input} {...props} />
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  );
}
