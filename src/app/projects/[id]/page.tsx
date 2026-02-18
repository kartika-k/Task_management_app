"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Project, Task, PaginatedTasks } from "@/lib/types";
import TaskModal from "@/components/TaskModal";
import ProjectModal from "@/components/ProjectModal";
import ActivityLog from "@/components/ActivityLog";

interface Filters {
  status: string;
  priority: string;
  sortBy: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "All",
    priority: "All",
    sortBy: "createdAt",
  });

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Project not found");
      const data = await res.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== "All") params.set("status", filters.status);
      if (filters.priority !== "All") params.set("priority", filters.priority);
      params.set("sortBy", filters.sortBy);
      params.set("sortOrder", "desc");

      const res = await fetch(`/api/projects/${id}/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data: PaginatedTasks = await res.json();
      const items = Array.isArray((data as unknown as any).items)
        ? (data as PaginatedTasks).items
        : ((data as unknown as any) as Task[]);
      if (Array.isArray(items)) {
        setTasks(items);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }, [id, filters]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProject();
      setLoading(false);
    };
    load();
  }, [fetchProject]);

  useEffect(() => {
    if (project) fetchTasks();
  }, [project, fetchTasks]);

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleDeleteProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      setDeleteConfirmOpen(false);
    }
  };

  const handleTaskSaved = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleProjectSaved = () => {
    setProjectModalOpen(false);
    fetchProject();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-white">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg mb-4">Project not found</p>
        <Link href="/" className="text-white hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  const statusBadgeClasses: Record<Task["status"], string> = {
    TODO: "bg-orange-100 text-orange-800 border border-orange-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border border-blue-300",
    DONE: "bg-green-100 text-green-800 border border-green-300",
  };

  const statusLabels: Record<Task["status"], string> = {
    TODO: "Todo",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  };

  const priorityBadgeClasses: Record<Task["priority"], string> = {
    HIGH: "bg-orange-100 text-orange-800 border border-orange-300",
    MEDIUM: "bg-orange-100 text-orange-800 border border-orange-300",
    LOW: "bg-green-100 text-green-800 border border-green-300",
  };

  const priorityLabels: Record<Task["priority"], string> = {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Projects / {project.name}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mb-2">{project.description}</p>
          )}
          <div className="text-sm text-gray-500 mb-4">
            Created on: {new Date(project.createdAt).toISOString().split("T")[0]}
          </div>
          <div className="flex gap-2 mb-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              « Back to Projects
            </Link>
            <button
              onClick={() => setProjectModalOpen(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              Edit Project
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 bg-[#2a869a] text-white rounded hover:bg-[#216e7e] text-sm"
            >
              Delete Project
            </button>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tasks »</h2>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setTaskModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#2a869a] text-white rounded hover:bg-[#216e7e] text-sm"
                >
                  + New Task
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="All">Status: All</option>
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="All">Priority: All</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="createdAt">Sort: Created (newest first)</option>
                  <option value="dueDate">Sort: Due Date</option>
                  <option value="updatedAt">Sort: Updated</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No tasks found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Title</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Priority</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Due Date</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Updated</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-b">
                          <td className="py-2 px-4">
                            <div className="font-medium text-gray-900">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-500">{task.description}</div>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusBadgeClasses[task.status]}`}
                            >
                              {statusLabels[task.status]}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityBadgeClasses[task.priority]}`}
                            >
                              {priorityLabels[task.priority]}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-gray-700">
                            {task.dueDate
                              ? new Date(task.dueDate).toISOString().split("T")[0]
                              : "-"}
                          </td>
                          <td className="py-2 px-4 text-gray-700">
                            {task.updatedAt
                              ? new Date(task.updatedAt).toISOString().split("T")[0]
                              : "-"}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setTaskModalOpen(true);
                                }}
                                className="px-3 py-1 bg-[#2a869a] text-white rounded hover:bg-[#216e7e] text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Project status
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-gray-600">
                    <span>To Do</span>
                    <span>{tasks.filter((t) => t.status === "TODO").length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-400"
                      style={{ 
                        width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === "TODO").length / tasks.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-gray-600">
                    <span>In Progress</span>
                    <span>{tasks.filter((t) => t.status === "IN_PROGRESS").length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ 
                        width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === "IN_PROGRESS").length / tasks.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-gray-600">
                    <span>Done</span>
                    <span>{tasks.filter((t) => t.status === "DONE").length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ 
                        width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Activity
              </h3>
              <ActivityLog projectId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {taskModalOpen && (
        <TaskModal
          projectId={id}
          task={editingTask}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSaved={handleTaskSaved}
        />
      )}

      {projectModalOpen && (
        <ProjectModal
          project={project}
          onClose={() => setProjectModalOpen(false)}
          onSaved={handleProjectSaved}
        />
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the project &apos;{project.name}&apos;? This will
              also delete all tasks related to this project. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
