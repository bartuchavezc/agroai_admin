import type { ReactNode } from "react";

import { fmtInt, label as defaultLabel } from "@/lib/format";
import type { Bucket } from "@/lib/types";

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, hint, children, className = "" }: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-4 sm:p-5 ${className}`}>
      {title && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-ink-3">{hint}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <div className="text-xs font-medium text-ink-2">{label}</div>
      <div className="tabular mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-ink-3">{hint}</div>}
    </div>
  );
}

export function Grid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 | 6 }) {
  const map = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };
  return <div className={`grid gap-3 ${map[cols]}`}>{children}</div>;
}

/** Horizontal bars, one series (one color), value labeled at the end of each bar. */
export function BarList({
  items,
  format = fmtInt,
  labelFor = defaultLabel,
  total,
  empty = "Sin datos todavía.",
}: {
  items: Bucket[];
  format?: (n: number) => string;
  labelFor?: (key: string) => string;
  total?: number;
  empty?: string;
}) {
  if (!items.length || items.every((i) => i.count === 0)) return <p className="text-sm text-ink-3">{empty}</p>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const share = total ? ` · ${Math.round((item.count / total) * 100)} %` : "";
        return (
          <li key={item.key} className="group" title={`${labelFor(item.key)}: ${format(item.count)}${share}`}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-ink-2 group-hover:text-ink">{labelFor(item.key)}</span>
              <span className="tabular shrink-0 font-medium">
                {format(item.count)}
                {share && <span className="font-normal text-ink-3">{share}</span>}
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2">
              <div
                className="h-2 rounded-full bg-series-1 transition-opacity group-hover:opacity-80"
                style={{ width: `${Math.max((item.count / max) * 100, item.count ? 1.5 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Part of a whole: one filled share against a neutral remainder, both labeled. */
export function SplitBar({ part, whole, partLabel, restLabel }: {
  part: number;
  whole: number;
  partLabel: string;
  restLabel: string;
}) {
  const pct = whole ? (part / whole) * 100 : 0;
  return (
    <div title={`${partLabel}: ${fmtInt(part)} de ${fmtInt(whole)}`}>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {pct > 0 && <div className="rounded-full bg-series-1" style={{ width: `${pct}%` }} />}
        {pct < 100 && <div className="flex-1 rounded-full bg-surface-2" />}
      </div>
      <div className="mt-2 flex justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-ink-2">
          <span className="size-2 rounded-full bg-series-1" />
          {partLabel} <b className="tabular font-medium text-ink">{fmtInt(part)}</b>
        </span>
        <span className="flex items-center gap-1.5 text-ink-2">
          <span className="size-2 rounded-full bg-surface-2 ring-1 ring-line" />
          {restLabel} <b className="tabular font-medium text-ink">{fmtInt(whole - part)}</b>
        </span>
      </div>
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "good" | "warn" | "bad" | "brand"; children: ReactNode }) {
  const tones = {
    neutral: "bg-surface-2 text-ink-2",
    good: "bg-good-soft text-good",
    warn: "bg-warn-soft text-warn",
    bad: "bg-bad-soft text-bad",
    brand: "bg-brand-soft text-brand-ink",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
