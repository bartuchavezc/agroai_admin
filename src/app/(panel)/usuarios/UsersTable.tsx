"use client";

import { type Column, SortableTable } from "@/components/SortableTable";
import { Pill } from "@/components/ui";
import { fmtAgo, fmtDate, fmtInt, fmtMinutes, label } from "@/lib/format";
import type { AdminUser } from "@/lib/types";

const time = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

export function UsersTable({ users, now }: { users: AdminUser[]; now: number }) {
  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "Usuario",
      sort: (u) => u.email,
      cell: (u) => (
        <div className="max-w-64">
          <div className="truncate font-medium">{[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email}</div>
          <div className="truncate text-xs text-ink-3">{u.email}</div>
        </div>
      ),
    },
    { key: "account", header: "Cuenta", sort: (u) => u.account_name, cell: (u) => <span className="text-ink-2">{u.account_name}</span> },
    { key: "role", header: "Rol", sort: (u) => u.role, cell: (u) => <Pill tone={u.role === "owner" ? "brand" : "neutral"}>{label(u.role)}</Pill> },
    {
      key: "state",
      header: "Estado",
      sort: (u) => (u.is_active ? 2 : 0) + (u.is_enrolled ? 1 : 0),
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {!u.is_active && <Pill tone="bad">Baja</Pill>}
          {u.is_active && !u.is_enrolled && <Pill tone="warn">Onboarding pendiente</Pill>}
          {u.is_active && u.is_enrolled && <Pill tone="good">Activo</Pill>}
          {!u.byok_configured && <Pill>Sin key</Pill>}
        </div>
      ),
    },
    { key: "profile", header: "Perfil", sort: (u) => u.profile ?? "", cell: (u) => <span className="text-ink-2">{u.profile ?? "—"}</span> },
    { key: "last", header: "Última actividad", sort: (u) => time(u.last_active_at), cell: (u) => fmtAgo(u.last_active_at, now) },
    { key: "sessions", header: "Sesiones", align: "right", sort: (u) => u.sessions, cell: (u) => fmtInt(u.sessions) },
    { key: "minutes", header: "Tiempo en chat", align: "right", sort: (u) => u.chat_minutes, cell: (u) => (u.chat_minutes ? fmtMinutes(u.chat_minutes) : "—") },
    { key: "messages", header: "Mensajes", align: "right", sort: (u) => u.user_messages, cell: (u) => fmtInt(u.user_messages) },
    { key: "conversations", header: "Chats", align: "right", sort: (u) => u.conversations, cell: (u) => fmtInt(u.conversations) },
    { key: "photos", header: "Fotos", align: "right", sort: (u) => u.photos, cell: (u) => fmtInt(u.photos) },
    { key: "events", header: "Eventos", align: "right", sort: (u) => u.events, cell: (u) => fmtInt(u.events) },
    { key: "created", header: "Alta", sort: (u) => time(u.created_at), cell: (u) => <span className="text-ink-2">{fmtDate(u.created_at)}</span> },
  ];
  return (
    <SortableTable
      rows={users}
      columns={columns}
      initialSort={{ key: "last", dir: "desc" }}
      search={(u) => `${u.email} ${u.first_name ?? ""} ${u.last_name ?? ""} ${u.account_name}`}
      searchPlaceholder="Buscar por nombre, email o cuenta"
    />
  );
}
