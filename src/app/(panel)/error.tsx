"use client";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-6 text-center">
      <h2 className="font-semibold">No se pudieron cargar las métricas</h2>
      <p className="mt-1 text-sm text-ink-2">La API no respondió como se esperaba. {error.digest && `(${error.digest})`}</p>
      <button type="button" onClick={reset} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
        Reintentar
      </button>
    </div>
  );
}
