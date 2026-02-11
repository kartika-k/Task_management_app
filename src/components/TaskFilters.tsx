"use client";

import { useState } from "react";

interface Filters {
  status: string[];
  priority: string[];
  sortBy: string;
  sortOrder: string;
  search: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export default function TaskFilters({ filters, onChange }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search);

  const toggleFilter = (
    key: "status" | "priority",
    value: string
  ) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onChange({ ...filters, search: searchInput });
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    onChange({
      status: [],
      priority: [],
      sortBy: "createdAt",
      sortOrder: "desc",
      search: "",
    });
  };

  const hasFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.search ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
      <div className="mb-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={() => onChange({ ...filters, search: searchInput })}
          placeholder="Search tasks by title or description..."
          className="w-full border border-slate-800 rounded-xl px-3 py-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 mr-1">Status:</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggleFilter("status", opt.value)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filters.status.includes(opt.value)
                ? "bg-primary text-slate-50 shadow-[0_0_12px_rgba(56,189,248,0.55)]"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 mr-1">
          Priority:
        </span>
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggleFilter("priority", opt.value)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filters.priority.includes(opt.value)
                ? "bg-primary text-slate-50 shadow-[0_0_12px_rgba(56,189,248,0.55)]"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
            className="text-xs border border-slate-800 rounded-lg px-2 py-1 bg-slate-950 text-slate-100"
          >
            <option value="createdAt">Created Date</option>
            <option value="dueDate">Due Date</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => onChange({ ...filters, sortOrder: e.target.value })}
            className="text-xs border border-slate-800 rounded-lg px-2 py-1 bg-slate-950 text-slate-100"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-danger underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
