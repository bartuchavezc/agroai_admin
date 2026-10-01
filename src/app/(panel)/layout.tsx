import { Logo } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import { getMe } from "@/lib/api";

import { logout } from "../actions";

export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const me = await getMe(); // redirects to /login without a valid admin session
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-semibold tracking-tight">AgroAI Admin</span>
          </div>
          <Nav />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-ink-2 md:inline">{me.email}</span>
            <form action={logout}>
              <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
