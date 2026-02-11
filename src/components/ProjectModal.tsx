"use client";

import { useState } from "react";
import { Project } from "@/lib/types";

interface Props {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectModal({ project, onClose, onSaved }: Props) {
  const isEdit = !!project;
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    if (!name.trim()) {
      setErrors({ name: ["Project name is required"] });
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/projects/${project.id}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
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
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/90 shadow-[0_22px_60px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_55%)]" />
        <div className="relative p-6">
          <h2 className="text-lg font-semibold mb-1 text-slate-50">
            {isEdit ? "Edit Project" : "New Project"}
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Give your project a name and an optional short description.
          </p>

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/40 text-danger px-3 py-2 rounded mb-4 text-xs">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1 text-slate-300">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Project name"
                autoFocus
              />
              {errors.name && (
                <p className="text-danger text-xs mt-1">{errors.name[0]}</p>
              )}
            </div>

            <div className="mb-6">
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
