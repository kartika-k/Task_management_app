"use client";

import { useEffect, useState } from "react";
import { ActivityLogEntry } from "@/lib/types";
import Link from "next/link";

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await fetch("/api/activity?page=1&pageSize=50");
        if (!res.ok) throw new Error("Failed to load activity");
        const data = await res.json();
        setItems(data.items ?? data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Activity
        </div>
        <h1 className="text-2xl font-semibold text-slate-50">
          Activity log
        </h1>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
        {loading && (
          <div className="text-sm text-slate-400">Loading activity...</div>
        )}

        {error && !loading && (
          <div className="text-sm text-danger">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-slate-400">No recent activity yet.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="divide-y divide-slate-800">
            {items.map((entry) => (
              <li
                key={entry.id}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-100">
                    {entry.message}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    {entry.projectName && (
                      <Link
                        href={`/projects/${entry.projectId}`}
                        className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200"
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
                        <span>{entry.projectName}</span>
                      </Link>
                    )}
                    <span>&middot;</span>
                    <span>
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
