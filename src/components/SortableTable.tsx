"use client";

import { useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sort?: (row: T) => number | string;
  align?: "left" | "right";
  className?: string;
};

export function SortableTable<T extends { id: string }>({ rows, columns, initialSort, search, searchPlaceholder }: {
  rows: T[];
  columns: Column<T>[];
  initialSort: { key: string; dir: "asc" | "desc" };
  search?: (row: T) => string;
  searchPlaceholder?: string;
}) {
  const [sort, setSort] = useState(initialSort);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q && search ? rows.filter((r) => search(r).toLowerCase().includes(q)) : rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sort) return filtered;
    const get = column.sort;
    return [...filtered].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "es");
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, sort, query, search]);

  const toggle = (key: string) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  return (
    <div className="space-y-3">
      {search && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-sm rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      )}
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2/60 text-left text-xs text-ink-2">
              {columns.map((c) => (
                <th key={c.key} className={`px-3 py-2.5 font-medium ${c.align === "right" ? "text-right" : ""}`}>
                  {c.sort ? (
                    <button type="button" onClick={() => toggle(c.key)} className="inline-flex items-center gap-1 hover:text-ink">
                      {c.header}
                      <span className="text-[10px] text-ink-3">
                        {sort.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-surface-2/50">
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-2.5 ${c.align === "right" ? "tabular text-right" : ""} ${c.className ?? ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-ink-3">Sin resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-3">{visible.length} de {rows.length}</p>
    </div>
  );
}
