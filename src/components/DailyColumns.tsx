"use client";

import { useState } from "react";

import { fmtInt } from "@/lib/format";

type Point = { day: string; value: number };

const dayLabel = (day: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${day}T12:00:00`).toLocaleDateString("es-AR", opts);

/** One metric per day as columns; hover (or tap) a day to read its value. */
export function DailyColumns({ title, points, totalLabel = "en el período", aggregate = "sum" }: {
  title: string;
  points: Point[];
  totalLabel?: string;
  aggregate?: "sum" | "avg";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.value), 1);
  const sum = points.reduce((acc, p) => acc + p.value, 0);
  const headline = aggregate === "sum" ? sum : sum / Math.max(points.length, 1);
  const active = hover != null ? points[hover] : null;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="tabular text-xs text-ink-3">máx {fmtInt(max)}</span>
      </div>
      <div className="mt-1 h-10">
        {active ? (
          <div>
            <div className="tabular text-2xl font-semibold tracking-tight">{fmtInt(active.value)}</div>
            <div className="text-xs text-ink-3">{dayLabel(active.day, { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
        ) : (
          <div>
            <div className="tabular text-2xl font-semibold tracking-tight">
              {aggregate === "sum" ? fmtInt(headline) : headline.toLocaleString("es-AR", { maximumFractionDigits: 1 })}
            </div>
            <div className="text-xs text-ink-3">{aggregate === "sum" ? totalLabel : "promedio diario"}</div>
          </div>
        )}
      </div>
      <div
        className="relative mt-4 flex h-24 items-end gap-[2px] border-b border-line"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`${title}: ${points.map((p) => `${p.day} ${p.value}`).join(", ")}`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-grid" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-grid" />
        {points.map((p, i) => (
          <button
            key={p.day}
            type="button"
            className="relative flex h-full flex-1 items-end focus:outline-none"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => setHover(i)}
            aria-label={`${p.day}: ${p.value}`}
          >
            <span
              className={`block w-full rounded-t-[3px] transition-colors ${
                hover === i ? "bg-brand-ink" : "bg-series-1"
              } ${p.value === 0 ? "opacity-0" : ""}`}
              style={{ height: `${Math.max((p.value / max) * 100, p.value ? 3 : 0)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink-3">
        <span>{points[0] && dayLabel(points[0].day, { day: "numeric", month: "short" })}</span>
        <span>{points.at(-1) && dayLabel(points.at(-1)!.day, { day: "numeric", month: "short" })}</span>
      </div>
    </div>
  );
}
