"use client";

import { useEffect, useState } from "react";
import { ActivityLogEntry } from "@/lib/types";

interface Props {
  projectId: string;
}

export default function ActivityLog({ projectId }: Props) {
  const [items, setItems] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await fetch(`/api/projects/${projectId}/activity?page=1&pageSize=20`);
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
  }, [projectId]);

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading activity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No recent activity yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2 text-sm">
      {items.map((entry) => (
        <li key={entry.id} className="flex justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-900">{entry.message}</span>
          <span className="text-gray-500 text-xs whitespace-nowrap">
            {new Date(entry.createdAt).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}


