"use client";

import { useTransition } from "react";

import { setUserActive } from "@/app/actions";
import type { AdminUser } from "@/lib/types";

/** Disable (asks first: it closes the user's sessions) or re-enable a user. */
export function ToggleActiveButton({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  if (isSelf) return <span className="text-xs text-ink-3">Vos</span>;

  const onClick = () => {
    if (user.is_active && !window.confirm(
      `¿Deshabilitar a ${user.email}? No va a poder ingresar y se cierran sus sesiones abiertas. Sus datos quedan.`,
    )) return;
    startTransition(async () => {
      const { error } = await setUserActive(user.id, !user.is_active);
      if (error) window.alert(error);
    });
  };

  return (
    <button type="button" onClick={onClick} disabled={pending}
      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${
        user.is_active
          ? "border-line text-ink-2 hover:border-bad hover:bg-bad-soft hover:text-bad"
          : "border-line text-ink-2 hover:border-good hover:bg-good-soft hover:text-good"
      }`}>
      {pending ? "…" : user.is_active ? "Deshabilitar" : "Habilitar"}
    </button>
  );
}
