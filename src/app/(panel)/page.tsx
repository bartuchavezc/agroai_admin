import Link from "next/link";

import { DailyColumns } from "@/components/DailyColumns";
import { BarList, Card, Grid, Pill, Section, SplitBar, StatTile } from "@/components/ui";
import { getOverview, getTimeseries } from "@/lib/api";
import { fmtAgo, fmtArea, fmtDateTime, fmtDec, fmtInt, fmtMinutes, fmtPct } from "@/lib/format";
import type { DailyPoint } from "@/lib/types";

const RANGES = [7, 30, 90, 365];

const TOOL_LABELS: Record<string, string> = {
  web_search: "Búsqueda web",
  remember_fact: "Recordar dato",
  recall_facts: "Consultar memoria",
  forget_fact: "Olvidar dato",
  get_current_weather: "Clima actual",
  get_forecast: "Pronóstico",
  log_event: "Registrar evento",
  create_crop_cycle: "Crear ciclo",
};
const toolLabel = (name: string) => TOOL_LABELS[name] ?? name.replaceAll("_", " ");

function series(points: DailyPoint[], key: keyof Omit<DailyPoint, "day">) {
  return points.map((p) => ({ day: p.day, value: p[key] }));
}

function freshness(iso: string | null, warnHours: number, now: number) {
  if (!iso) return <Pill tone="warn">sin datos</Pill>;
  const hours = (now - new Date(iso).getTime()) / 3_600_000;
  return <Pill tone={hours > warnHours ? "warn" : "good"}>{fmtAgo(iso, now)}</Pill>;
}

export default async function OverviewPage({ searchParams }: PageProps<"/">) {
  const requested = Number((await searchParams).days);
  const days = RANGES.includes(requested) ? requested : 30;
  const [o, ts] = await Promise.all([getOverview(days), getTimeseries(days)]);
  const now = new Date(o.generated_at).getTime();
  const { users, accounts, photos, conversations: conv, sessions, farm, agent } = o;
  const windowLabel = `últimos ${days} días`;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
          <p className="mt-1 text-sm text-ink-2">
            Cómo se usa AgroAI · actualizado {fmtDateTime(o.generated_at)}
          </p>
        </div>
        <div className="flex rounded-lg border border-line bg-surface p-0.5 text-sm" role="group" aria-label="Período">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/?days=${r}`}
              className={`rounded-md px-3 py-1.5 font-medium ${
                r === days ? "bg-brand-soft text-brand-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {r === 365 ? "1 año" : `${r} d`}
            </Link>
          ))}
        </div>
      </div>

      <Grid cols={4}>
        <StatTile label="Usuarios" value={fmtInt(users.total)} hint={`+${fmtInt(users.new_in_window)} en ${windowLabel}`} />
        <StatTile
          label="Usuarios activos (30 d)"
          value={fmtInt(users.mau)}
          hint={`${fmtInt(users.wau)} en 7 d · ${fmtInt(users.dau)} hoy`}
        />
        <StatTile label="Cuentas" value={fmtInt(accounts.total)} hint={`${fmtInt(accounts.with_activity_in_window)} con actividad en el período`} />
        <StatTile label="Fotos subidas" value={fmtInt(photos.total)} hint={`+${fmtInt(photos.in_window)} en el período`} />
        <StatTile label="Sesiones de uso" value={fmtInt(sessions.total)} hint={`${fmtDec(sessions.sessions_per_user)} por usuario en el período`} />
        <StatTile label="Duración de sesión" value={fmtMinutes(sessions.median_minutes)} hint={`mediana · promedio ${fmtMinutes(sessions.avg_minutes)}`} />
        <StatTile label="Campos" value={fmtInt(farm.fields_total)} hint={`${fmtDec(farm.avg_fields_per_account)} por cuenta con campos`} />
        <StatTile label="Superficie total" value={fmtArea(farm.area_total_m2)} hint={`mediana ${fmtArea(farm.area_median_m2)} por campo`} />
      </Grid>

      <Section title="Actividad diaria" description={`Por día, zona horaria ${ts.timezone}.`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DailyColumns title="Usuarios activos" points={series(ts.points, "active_users")} aggregate="avg" />
          <DailyColumns title="Mensajes al agente" points={series(ts.points, "user_messages")} />
          <DailyColumns title="Sesiones" points={series(ts.points, "sessions")} />
          <DailyColumns title="Fotos subidas" points={series(ts.points, "photos")} />
          <DailyColumns title="Eventos registrados" points={series(ts.points, "events")} />
          <DailyColumns title="Altas de usuarios" points={series(ts.points, "signups")} />
        </div>
      </Section>

      <Section title="Usuarios y permisos" description="Roles por cuenta: owner administra, técnico gestiona campos, staff registra.">
        <div className="grid gap-3 lg:grid-cols-3">
          <Card title="Por rol">
            <BarList items={users.by_role} total={users.total} />
          </Card>
          <Card title="Estado" hint="Un usuario dado de baja conserva su historial pero no puede ingresar.">
            <div className="space-y-5">
              <SplitBar part={users.active} whole={users.total} partLabel="Activos" restLabel="Dados de baja" />
              <SplitBar part={users.enrolled} whole={users.total} partLabel="Onboarding completo" restLabel="Pendiente" />
              <SplitBar part={users.byok_configured} whole={users.total} partLabel="Con key de Gemini" restLabel="Sin key" />
            </div>
          </Card>
          <Card title="Retención" hint="Activo = mandó un mensaje, subió una foto o cargó un evento.">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-ink-2">Activos hoy (DAU)</dt><dd className="tabular text-right font-medium">{fmtInt(users.dau)}</dd>
              <dt className="text-ink-2">Activos 7 d (WAU)</dt><dd className="tabular text-right font-medium">{fmtInt(users.wau)}</dd>
              <dt className="text-ink-2">Activos 30 d (MAU)</dt><dd className="tabular text-right font-medium">{fmtInt(users.mau)}</dd>
              <dt className="text-ink-2">Stickiness DAU/MAU</dt><dd className="tabular text-right font-medium">{fmtPct(users.dau, users.mau)}</dd>
              <dt className="text-ink-2">MAU / usuarios</dt><dd className="tabular text-right font-medium">{fmtPct(users.mau, users.active)}</dd>
              <dt className="text-ink-2">Usuarios por cuenta</dt><dd className="tabular text-right font-medium">{fmtDec(accounts.avg_users_per_account)}</dd>
              <dt className="text-ink-2">Cuentas con equipo</dt><dd className="tabular text-right font-medium">{fmtInt(accounts.multi_user)}</dd>
              <dt className="text-ink-2">Cuentas nuevas</dt><dd className="tabular text-right font-medium">{fmtInt(accounts.new_in_window)}</dd>
            </dl>
          </Card>
        </div>
      </Section>

      <Section
        title="Sesiones y chat"
        description={`Sesión = mensajes de un usuario con menos de ${sessions.gap_minutes} min entre sí (${windowLabel}); dura del primer mensaje a la última respuesta.`}
      >
        <Grid cols={6}>
          <StatTile label="Sesiones" value={fmtInt(sessions.total)} hint={`${fmtInt(sessions.users)} usuarios`} />
          <StatTile label="Duración mediana" value={fmtMinutes(sessions.median_minutes)} />
          <StatTile label="Duración p90" value={fmtMinutes(sessions.p90_minutes)} hint="el 10 % más largo" />
          <StatTile label="Mensajes por sesión" value={fmtDec(sessions.median_turns)} hint={`mediana · prom. ${fmtDec(sessions.avg_turns)}`} />
          <StatTile label="Conversaciones" value={fmtInt(conv.total)} hint={`+${fmtInt(conv.in_window)} en el período`} />
          <StatTile label="Mensajes al agente" value={fmtInt(conv.user_messages)} hint={`+${fmtInt(conv.user_messages_in_window)} en el período`} />
        </Grid>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card title="Largo de las sesiones" hint={windowLabel}>
            <BarList items={sessions.length_buckets} total={sessions.total} labelFor={(k) => k} />
          </Card>
          <Card title="Conversaciones" hint="Hilos de chat (cada usuario tiene los suyos, privados).">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-ink-2">Usuarios que chatearon</dt><dd className="tabular text-right font-medium">{fmtInt(conv.users_with_conversations)}</dd>
              <dt className="text-ink-2">Mensajes por conversación</dt><dd className="tabular text-right font-medium">{fmtDec(conv.median_messages_per_conversation)} <span className="font-normal text-ink-3">(mediana)</span></dd>
              <dt className="text-ink-2">Promedio por conversación</dt><dd className="tabular text-right font-medium">{fmtDec(conv.avg_messages_per_conversation)}</dd>
              <dt className="text-ink-2">Archivadas</dt><dd className="tabular text-right font-medium">{fmtInt(conv.archived)}</dd>
              <dt className="text-ink-2">Mensajes totales</dt><dd className="tabular text-right font-medium">{fmtInt(conv.messages_total)}</dd>
            </dl>
          </Card>
        </div>
      </Section>

      <Section title="Fotos y análisis" description="Cada foto subida crea un reporte; las de seguimiento y suelo se analizan solas, las de diagnóstico desde el chat.">
        <Grid cols={4}>
          <StatTile label="Fotos totales" value={fmtInt(photos.total)} hint={`${fmtInt(photos.uploads)} subidas + ${fmtInt(photos.layout_photos)} del plano`} />
          <StatTile label="Usadas en el chat" value={fmtInt(photos.used_in_chat)} />
          <StatTile label="Usuarios que subieron fotos" value={fmtInt(photos.users_with_photos)} hint={fmtPct(photos.users_with_photos, users.total) + " de los usuarios"} />
          <StatTile
            label="Análisis exitosos"
            value={photos.diagnosis_success_rate == null ? "—" : `${fmtDec(photos.diagnosis_success_rate * 100)} %`}
            hint="analizadas / (analizadas + fallidas)"
          />
        </Grid>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card title="Por tipo de reporte"><BarList items={photos.by_type} total={photos.uploads} /></Card>
          <Card title="Estado del análisis"><BarList items={photos.by_status} total={photos.uploads} /></Card>
        </div>
      </Section>

      <Section title="Huertas" description="Campos, superficie declarada, ciclos de cultivo y eventos.">
        <Grid cols={6}>
          <StatTile label="Campos" value={fmtInt(farm.fields_total)} hint={`+${fmtInt(farm.fields_in_window)} en el período`} />
          <StatTile label="Con superficie" value={fmtInt(farm.fields_with_area)} hint={fmtPct(farm.fields_with_area, farm.fields_total)} />
          <StatTile label="Superficie promedio" value={fmtArea(farm.area_avg_m2)} hint={`de ${fmtArea(farm.area_min_m2)} a ${fmtArea(farm.area_max_m2)}`} />
          <StatTile label="Ciclos activos" value={fmtInt(farm.crop_cycles_active)} hint={`${fmtInt(farm.crop_cycles_total)} en total`} />
          <StatTile label="Eventos" value={fmtInt(farm.events_total)} hint={`+${fmtInt(farm.events_in_window)} en el período`} />
          <StatTile label="Cuentas con campos" value={fmtInt(accounts.with_fields)} hint={fmtPct(accounts.with_fields, accounts.total)} />
        </Grid>
        <div className="grid gap-3 lg:grid-cols-3">
          <Card title="Tamaño de los campos" hint="Solo los que declararon superficie.">
            <BarList items={farm.area_buckets} total={farm.fields_with_area} labelFor={(k) => k} />
          </Card>
          <Card title="Cultivos más sembrados" hint="Ciclos por cultivo.">
            <BarList items={farm.top_crops} labelFor={(k) => k} />
          </Card>
          <Card title="Ciclos por estado"><BarList items={farm.cycles_by_status} total={farm.crop_cycles_total} /></Card>
          <Card title="Eventos por tipo"><BarList items={farm.events_by_type} total={farm.events_total} /></Card>
          <Card title="Quién registra los eventos"><BarList items={farm.events_by_source} total={farm.events_total} /></Card>
          <Card title="Datos del campo">
            <div className="space-y-5">
              <SplitBar part={farm.fields_with_location} whole={farm.fields_total} partLabel="Con ubicación" restLabel="Sin ubicación" />
              <SplitBar part={farm.fields_with_boundary} whole={farm.fields_total} partLabel="Con contorno" restLabel="Sin contorno" />
              <SplitBar part={farm.fields_with_layout} whole={farm.fields_total} partLabel="Con plano" restLabel="Sin plano" />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Agente" description={`Herramientas que usó el agente (${windowLabel}).`}>
        <Grid cols={4}>
          <StatTile label="Llamadas a herramientas" value={fmtInt(agent.tool_calls)} hint={`${fmtInt(agent.tool_calls_failed)} con error (${fmtPct(agent.tool_calls_failed, agent.tool_calls)})`} />
          <StatTile label="Respuestas con herramientas" value={fmtInt(agent.turns_with_tools)} />
          <StatTile label="Respuestas con búsqueda web" value={fmtInt(agent.turns_with_search)} />
          <StatTile label="Memorias activas" value={fmtInt(agent.memories_active)} hint={`+${fmtInt(agent.memories_in_window)} en el período`} />
        </Grid>
        <Card title="Uso por herramienta">
          <BarList
            items={agent.tools.slice(0, 15).map((t) => ({ key: t.name, count: t.calls }))}
            labelFor={(name) => {
              const failed = agent.tools.find((t) => t.name === name)?.failed ?? 0;
              return failed ? `${toolLabel(name)} · ${fmtInt(failed)} con error` : toolLabel(name);
            }}
            total={agent.tool_calls}
          />
        </Card>
      </Section>

      <Section title="Adopción de módulos" description="Cuántas cuentas usan cada parte de la app (al menos un registro).">
        <Card>
          <BarList
            items={o.modules.map((m) => ({ key: m.module, count: m.accounts }))}
            labelFor={(k) => {
              const records = o.modules.find((m) => m.module === k)?.records ?? 0;
              return `${k} · ${fmtInt(records)} registros`;
            }}
            total={accounts.total}
          />
        </Card>
      </Section>

      <Section title="Perfiles de usuario" description="Respuestas del cuestionario de onboarding.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Perfil"><BarList items={o.profiles.profile} labelFor={(k) => k} /></Card>
          <Card title="Experiencia"><BarList items={o.profiles.experience} labelFor={(k) => k} /></Card>
          <Card title="Objetivo"><BarList items={o.profiles.goal} labelFor={(k) => k} /></Card>
        </div>
      </Section>

      <Section title="Alertas y sistema">
        <div className="grid gap-3 lg:grid-cols-3">
          <Card title="Alertas" hint={`${fmtInt(o.alerts.total)} en total · ${fmtInt(o.alerts.unacknowledged)} sin leer · +${fmtInt(o.alerts.in_window)} en el período`}>
            <BarList items={o.alerts.by_source} total={o.alerts.total} />
          </Card>
          <Card title="Por severidad"><BarList items={o.alerts.by_severity} total={o.alerts.total} /></Card>
          <Card title="Salud">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-ink-2">Base de datos</dt><dd><Pill tone={o.system.database === "ok" ? "good" : "bad"}>{o.system.database}</Pill></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-2">Último pronóstico SMN (worker)</dt><dd>{freshness(o.system.last_forecast_issued_at, 18, now)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-2">Último clima observado</dt><dd>{freshness(o.system.last_weather_observation_at, 48, now)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-2">Último mensaje al agente</dt><dd><Pill>{fmtAgo(o.system.last_message_at, now)}</Pill></dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-2">Última foto</dt><dd><Pill>{fmtAgo(o.system.last_report_at, now)}</Pill></dd></div>
            </dl>
          </Card>
        </div>
      </Section>
    </div>
  );
}
