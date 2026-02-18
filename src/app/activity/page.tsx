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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Activity log
          </h1>
        </div>

        {loading && (
          <div className="text-sm text-gray-500 py-8">Loading activity...</div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-gray-500 py-8">No recent activity yet.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {items.map((entry) => (
              <li
                key={entry.id}
                className="py-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    {entry.message}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    {entry.projectName && (
                      <Link
                        href={`/projects/${entry.projectId}`}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700"
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-600" />
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
