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
        <div className="text-white">Loading projects...</div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            TaskFlow
          </h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base max-w-xl">
            Organize your projects and tasks with priorities, due dates, filters,
            and activity tracking.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-lg bg-[#2a869a] text-white hover:bg-[#216e7e] transition-colors text-sm"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Log in
            </Link>
          </div>
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-xs text-gray-600 max-w-xl">
            After signing in, you&apos;ll be able to create projects, add tasks,
            filter and sort, and see an activity log similar to the UI shown in
            your design.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <button
            onClick={() => {
              setEditingProject(null);
              setModalOpen(true);
            }}
            className="bg-[#2a869a] text-white px-4 py-2 rounded hover:bg-[#216e7e] text-sm"
          >
            + New Project
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
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
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2 font-medium">No projects yet</p>
            <p className="text-sm">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <Link href={`/projects/${project.id}`}>
                  <h2 className="text-lg font-semibold mb-1 text-gray-900 hover:text-[#2a869a] transition-colors">
                    {project.name}
                  </h2>
                </Link>
                {project.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {project._count?.tasks ?? 0} task
                    {(project._count?.tasks ?? 0) !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setModalOpen(true);
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                    >
                      {deletingId === project.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
