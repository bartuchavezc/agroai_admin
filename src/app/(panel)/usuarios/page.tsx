import { Grid, StatTile } from "@/components/ui";
import { getUsers } from "@/lib/api";
import { fmtInt, requestTime } from "@/lib/format";

import { UsersTable } from "./UsersTable";

export default async function UsersPage() {
  const users = await getUsers();
  const now = requestTime();
  const count = (pred: (u: (typeof users)[number]) => boolean) => users.filter(pred).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-ink-2">Uso por persona. Nunca se muestra el contenido de los chats ni las keys.</p>
      </div>
      <Grid cols={4}>
        <StatTile label="Usuarios" value={fmtInt(users.length)} />
        <StatTile label="Owners" value={fmtInt(count((u) => u.role === "owner"))} />
        <StatTile label="Técnicos" value={fmtInt(count((u) => u.role === "tecnico"))} />
        <StatTile label="Staff" value={fmtInt(count((u) => u.role === "staff"))} />
      </Grid>
      <UsersTable users={users} now={now} />
    </div>
  );
}
