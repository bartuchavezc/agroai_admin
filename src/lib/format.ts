const nf = new Intl.NumberFormat("es-AR");
const nf1 = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

export const fmtInt = (n: number) => nf.format(Math.round(n));
export const fmtDec = (n: number) => nf1.format(n);
export const fmtPct = (part: number, whole: number) => (whole ? `${nf1.format((part / whole) * 100)} %` : "—");

export function fmtArea(m2: number | null | undefined): string {
  if (m2 == null) return "—";
  if (m2 >= 10000) return `${nf1.format(m2 / 10000)} ha`;
  return `${nf1.format(m2)} m²`;
}

export function fmtMinutes(min: number): string {
  if (min < 1) return `${Math.round(min * 60)} s`;
  if (min < 60) return `${nf1.format(min)} min`;
  return `${nf1.format(min / 60)} h`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function fmtAgo(iso: string | null | undefined, now: number): string {
  if (!iso) return "nunca";
  const minutes = (now - new Date(iso).getTime()) / 60000;
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `hace ${Math.round(hours)} h`;
  const days = hours / 24;
  if (days < 30) return `hace ${Math.round(days)} d`;
  return fmtDate(iso);
}

// Labels for the API's enum values (anything unknown is shown as-is).
const LABELS: Record<string, string> = {
  owner: "Owner",
  tecnico: "Técnico",
  staff: "Staff",
  diagnosis: "Diagnóstico",
  periodic: "Seguimiento",
  soil: "Suelo",
  ANALYSIS_COMPLETED: "Analizada",
  ANALYSIS_FAILED: "Falló el análisis",
  PENDING_ANALYSIS: "Sin analizar",
  planned: "Planificado",
  planted: "Plantado",
  growing: "Creciendo",
  harvested: "Cosechado",
  failed: "Perdido",
  sowing: "Siembra",
  transplant: "Trasplante",
  irrigation: "Riego",
  fertilization: "Fertilización",
  treatment: "Tratamiento",
  pruning: "Poda",
  weeding: "Desmalezado",
  pest_sighting: "Plaga",
  disease_sighting: "Enfermedad",
  harvest: "Cosecha",
  observation: "Observación",
  photo: "Foto",
  user: "Usuario",
  agent: "Agente",
  rule: "Regla",
  smn: "Pronóstico SMN",
  irrigation_alert: "Riego",
  satellite: "Satélite",
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
  "sin dato": "Sin dato",
};

export const label = (key: string) => LABELS[key] ?? key.replaceAll("_", " ");

/** Reference time for "hace X" labels, taken once per server render. */
export const requestTime = () => Date.now();
