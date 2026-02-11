"use client";

import { useEffect, useState, useCallback } from "react";
import { Project, AuthUser } from "@/lib/types";
import ProjectModal from "@/components/ProjectModal";
import Link from "next/link";

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user, fetchProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditingProject(null);
    fetchProjects();
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-muted">Loading projects...</div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-50">
            TaskFlow
          </h1>
          <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-xl">
            Organize your projects and tasks with priorities, due dates, filters,
            and activity tracking.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shadow-[0_0_18px_rgba(56,189,248,0.6)] text-sm"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-900 transition-colors text-sm"
            >
              Log in
            </Link>
          </div>
          <div className="border border-dashed border-slate-700 rounded-lg p-4 text-xs text-slate-400 max-w-xl">
            After signing in, you&apos;ll be able to create projects, add tasks,
            filter and sort, and see an activity log similar to the UI shown in
            your design.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Dashboard
          </div>
          <h1 className="text-2xl font-semibold text-slate-50">Projects</h1>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors shadow-[0_0_18px_rgba(56,189,248,0.55)]"
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-danger px-4 py-3 rounded-xl mb-2 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            dismiss
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-2 font-medium">No projects yet</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl border border-slate-800/80 bg-slate-900/70 hover:bg-slate-900/90 hover:border-sky-500/40 transition-colors shadow-[0_18px_45px_rgba(0,0,0,0.85)] p-5 relative overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_55%)]" />
              <div className="relative">
              <Link href={`/projects/${project.id}`}>
                <h2 className="text-lg font-semibold mb-1 text-slate-50 group-hover:text-sky-300 transition-colors">
                  {project.name}
                </h2>
              </Link>
              {project.description && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  {project._count?.tasks ?? 0} task
                  {(project._count?.tasks ?? 0) !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setModalOpen(true);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="text-xs text-danger hover:text-danger-hover transition-colors disabled:opacity-50"
                  >
                    {deletingId === project.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setModalOpen(false);
            setEditingProject(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
