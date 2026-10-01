import { Grid, StatTile } from "@/components/ui";
import { getAccounts } from "@/lib/api";
import { fmtArea, fmtInt, requestTime } from "@/lib/format";

import { AccountsTable } from "./AccountsTable";

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const now = requestTime();
  const sum = (pick: (a: (typeof accounts)[number]) => number) => accounts.reduce((acc, a) => acc + pick(a), 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cuentas</h1>
        <p className="mt-1 text-sm text-ink-2">Cada cuenta es una familia o equipo que comparte campos y la memoria del agente.</p>
      </div>
      <Grid cols={4}>
        <StatTile label="Cuentas" value={fmtInt(accounts.length)} />
        <StatTile label="Con más de un miembro" value={fmtInt(accounts.filter((a) => a.users > 1).length)} />
        <StatTile label="Campos" value={fmtInt(sum((a) => a.fields))} />
        <StatTile label="Superficie total" value={fmtArea(sum((a) => a.area_m2))} />
      </Grid>
      <AccountsTable accounts={accounts} now={now} />
    </div>
  );
}
