"use client";

interface Filters {
  status: string;
  priority: string;
  sortBy: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function TaskFilters({ filters, onChange }: Props) {
  return (
    <div className="flex gap-4 mb-4">
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="border border-gray-300 rounded px-3 py-1 text-sm"
      >
        <option value="All">Status: All</option>
        <option value="TODO">Todo</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="border border-gray-300 rounded px-3 py-1 text-sm"
      >
        <option value="All">Priority: All</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <select
        value={filters.sortBy}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
        className="border border-gray-300 rounded px-3 py-1 text-sm"
      >
        <option value="createdAt">Sort: Created (newest first)</option>
        <option value="dueDate">Sort: Due Date</option>
        <option value="updatedAt">Sort: Updated</option>
      </select>
    </div>
  );
}
