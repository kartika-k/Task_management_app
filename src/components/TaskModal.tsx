"use client";

import { useState } from "react";
import { Task } from "@/lib/types";

interface Props {
  projectId: string;
  task: Task | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TaskModal({ projectId, task, onClose, onSaved }: Props) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<Task["status"]>(task?.status ?? "TODO");
  const [priority, setPriority] = useState<Task["priority"]>(
    task?.priority ?? "MEDIUM"
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    // Client-side validation
    if (!title.trim()) {
      setErrors({ title: ["Task title is required"] });
      return;
    }

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/projects/${projectId}/tasks/${task.id}`
        : `/api/projects/${projectId}/tasks`;
      const method = isEdit ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate
          ? new Date(dueDate + "T00:00:00.000Z").toISOString()
          : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.details) {
          setErrors(data.details);
        } else {
          setApiError(data.error || "Something went wrong");
        }
        return;
      }

      onSaved();
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-[0_22px_60px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_55%)]" />
        <div className="relative p-6">
          <h2 className="text-lg font-semibold mb-1 text-slate-50">
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Capture the key details to keep this task moving.
          </p>

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/40 text-danger px-3 py-2 rounded mb-4 text-xs">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1 text-slate-300">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Task title"
                autoFocus
              />
              {errors.title && (
                <p className="text-danger text-xs mt-1">{errors.title[0]}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium mb-1 text-slate-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                rows={3}
                placeholder="Optional description"
              />
              {errors.description && (
                <p className="text-danger text-xs mt-1">
                  {errors.description[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task["status"])}
                  className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-300">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as Task["priority"])
                  }
                  className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium mb-1 text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              {errors.dueDate && (
                <p className="text-danger text-xs mt-1">{errors.dueDate[0]}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-[0_0_18px_rgba(56,189,248,0.6)]"
              >
                {saving ? "Saving..." : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
