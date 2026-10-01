"use client";

import { type Column, SortableTable } from "@/components/SortableTable";
import { fmtAgo, fmtArea, fmtDate, fmtInt } from "@/lib/format";
import type { AdminAccount } from "@/lib/types";

const time = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

export function AccountsTable({ accounts, now }: { accounts: AdminAccount[]; now: number }) {
  const columns: Column<AdminAccount>[] = [
    { key: "name", header: "Cuenta", sort: (a) => a.name, cell: (a) => <span className="font-medium">{a.name}</span> },
    {
      key: "users",
      header: "Miembros",
      align: "right",
      sort: (a) => a.users,
      cell: (a) => (
        <span title={`${a.owners} owner · ${a.tecnicos} técnico · ${a.staff} staff`}>
          {fmtInt(a.active_users)}
          {a.users !== a.active_users && <span className="text-ink-3"> / {fmtInt(a.users)}</span>}
        </span>
      ),
    },
    {
      key: "roles",
      header: "Roles (O · T · S)",
      align: "right",
      sort: (a) => a.tecnicos + a.staff,
      cell: (a) => <span className="text-ink-2">{a.owners} · {a.tecnicos} · {a.staff}</span>,
    },
    { key: "last", header: "Última actividad", sort: (a) => time(a.last_active_at), cell: (a) => fmtAgo(a.last_active_at, now) },
    { key: "fields", header: "Campos", align: "right", sort: (a) => a.fields, cell: (a) => fmtInt(a.fields) },
    { key: "area", header: "Superficie", align: "right", sort: (a) => a.area_m2, cell: (a) => (a.area_m2 ? fmtArea(a.area_m2) : "—") },
    {
      key: "cycles",
      header: "Ciclos activos",
      align: "right",
      sort: (a) => a.crop_cycles_active,
      cell: (a) => <span>{fmtInt(a.crop_cycles_active)}<span className="text-ink-3"> / {fmtInt(a.crop_cycles)}</span></span>,
    },
    { key: "photos", header: "Fotos", align: "right", sort: (a) => a.photos, cell: (a) => fmtInt(a.photos) },
    { key: "conversations", header: "Chats", align: "right", sort: (a) => a.conversations, cell: (a) => fmtInt(a.conversations) },
    { key: "messages", header: "Mensajes", align: "right", sort: (a) => a.user_messages, cell: (a) => fmtInt(a.user_messages) },
    { key: "events", header: "Eventos", align: "right", sort: (a) => a.events, cell: (a) => fmtInt(a.events) },
    { key: "created", header: "Alta", sort: (a) => time(a.created_at), cell: (a) => <span className="text-ink-2">{fmtDate(a.created_at)}</span> },
  ];
  return (
    <SortableTable
      rows={accounts}
      columns={columns}
      initialSort={{ key: "last", dir: "desc" }}
      search={(a) => a.name}
      searchPlaceholder="Buscar cuenta"
    />
  );
}
