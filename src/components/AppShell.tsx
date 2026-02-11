"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";

interface Props {
  children: React.ReactNode;
}

export default function AppShell({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const showSidebar = pathname !== "/";

  return (
    <div className="min-h-screen flex">
      {showSidebar && (
        <aside
          className={`hidden md:flex flex-col border-r border-border/70 bg-black/30 backdrop-blur-xl transition-all duration-300 ${
            collapsed ? "md:w-16 lg:w-20" : "md:w-56 lg:w-64"
          }`}
        >
          <div className="px-4 pt-5 pb-3 flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 tracking-tight"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500/15 ring-1 ring-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.45)]">
                <span className="h-3 w-3 rounded-full bg-sky-400" />
              </span>
              {!collapsed && <span>TaskFlow</span>}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-[10px] text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {collapsed ? "»" : "«"}
            </button>
          </div>

          <nav className="px-2 py-4 space-y-1 text-xs text-muted">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sky-500/15 text-sky-200 border border-sky-500/40"
            >
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              {!collapsed && <span>Dashboard</span>}
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/70 hover:text-slate-100 transition-colors"
            >
              <span className="h-1.5 w-6 rounded-full bg-slate-600/70" />
              {!collapsed && <span>Projects</span>}
            </Link>
            <Link
              href="/activity"
              className="flex w-full items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/70 hover:text-slate-100 transition-colors text-left"
            >
              <span className="h-1.5 w-6 rounded-full bg-slate-600/70" />
              {!collapsed && <span>Activity</span>}
            </Link>
          </nav>

          <div className="mt-auto px-3 pb-4 pt-3 border-t border-border/60">
            <UserMenu />
          </div>
        </aside>
      )}

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
}

