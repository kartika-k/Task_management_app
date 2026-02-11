"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Project, Task, PaginatedTasks } from "@/lib/types";
import TaskModal from "@/components/TaskModal";
import TaskFilters from "@/components/TaskFilters";
import ActivityLog from "@/components/ActivityLog";

interface Filters {
  status: string[];
  priority: string[];
  sortBy: string;
  sortOrder: string;
  search: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksTotal, setTasksTotal] = useState(0);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    priority: [],
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
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
      if (filters.status.length > 0)
        params.set("status", filters.status.join(","));
      if (filters.priority.length > 0)
        params.set("priority", filters.priority.join(","));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      params.set("page", String(tasksPage));
      params.set("pageSize", String(pageSize));
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/projects/${id}/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data: PaginatedTasks = await res.json();
      const items = Array.isArray((data as unknown as any).items)
        ? (data as PaginatedTasks).items
        : ((data as unknown as any) as Task[]);
      if (Array.isArray(items)) {
        setTasks(items);
        if (!Array.isArray(data as unknown as any)) {
          setTasksTotal((data as PaginatedTasks).total ?? items.length);
        } else {
          setTasksTotal(items.length);
        }
      } else {
        setTasks([]);
        setTasksTotal(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }, [id, filters, tasksPage]);

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

  const totalPages = Math.max(1, Math.ceil(tasksTotal / pageSize));

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleTaskSaved = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-muted">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-danger text-lg mb-4">Project not found</p>
        <Link href="/" className="text-primary hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  const todoCount = tasks.filter((t) => t.status === "TODO").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const totalForBars = Math.max(1, todoCount + inProgressCount + doneCount);

  const priorityBadgeClasses: Record<Task["priority"], string> = {
    HIGH:
      "bg-rose-500/10 text-rose-300 border border-rose-500/40 shadow-[0_0_14px_rgba(244,63,94,0.35)]",
    MEDIUM:
      "bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-[0_0_14px_rgba(245,158,11,0.25)]",
    LOW: "bg-slate-800/80 text-slate-200 border border-slate-700",
  };

  const priorityLabels: Record<Task["priority"], string> = {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="text-xs text-slate-400 hover:text-slate-100 transition-colors mb-1 inline-block"
      >
        &larr; Back to projects
      </Link>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start justify-between gap-6 shadow-[0_22px_60px_rgba(0,0,0,0.9)]">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Projects / <span className="text-slate-200">{project.name}</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1 text-slate-50">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-slate-400 text-sm">{project.description}</p>
          )}
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs">
              {todoCount} To Do
            </span>
            <span className="bg-sky-500/10 text-sky-300 px-3 py-1 rounded-full text-xs">
              {inProgressCount} In Progress
            </span>
            <span className="bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full text-xs">
              {doneCount} Done
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-slate-200 hover:bg-slate-800"
          >
            Back to Projects
          </Link>
          <button
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs hover:bg-primary-hover shadow-[0_0_18px_rgba(56,189,248,0.55)]"
          >
            + New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-danger px-4 py-3 rounded-lg mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline text-sm"
          >
            dismiss
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50">Tasks</h2>
          </div>

          <TaskFilters filters={filters} onChange={setFilters} />

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No tasks found.</p>
            </div>
          ) : (
            <>
          <div className="overflow-x-auto bg-slate-950/80 border border-slate-800 rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-400">
                    Title
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-slate-400">
                    Status
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-slate-400">
                    Priority
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-slate-400">
                    Due Date
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-slate-400">
                    Updated
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-slate-800 last:border-0">
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-100">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-slate-400">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(
                            task.id,
                            e.target.value as Task["status"]
                          )
                        }
                        className="text-xs border border-slate-700 rounded px-2 py-1 bg-slate-900 text-slate-100"
                      >
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11px] font-medium ${priorityBadgeClasses[task.priority]}`}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {task.updatedAt
                        ? new Date(task.updatedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setTaskModalOpen(true);
                        }}
                        className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-3 py-1 text-xs rounded-lg bg-danger text-white hover:bg-danger-hover"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted">
                Page {tasksPage} of {totalPages} ({tasksTotal} tasks)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={tasksPage === 1}
                  onClick={() => setTasksPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-slate-700 rounded-lg disabled:opacity-50 bg-slate-900 text-slate-100 hover:bg-slate-800"
                >
                  Previous
                </button>
                <button
                  disabled={tasksPage === totalPages}
                  onClick={() =>
                    setTasksPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="px-3 py-1 border border-slate-700 rounded-lg disabled:opacity-50 bg-slate-900 text-slate-100 hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-50 mb-4">
              Project status
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-400">
                  <span>To Do</span>
                  <span>{todoCount}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-500"
                    style={{ width: `${(todoCount / totalForBars) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-slate-400">
                  <span>In Progress</span>
                  <span>{inProgressCount}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{ width: `${(inProgressCount / totalForBars) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-slate-400">
                  <span>Done</span>
                  <span>{doneCount}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${(doneCount / totalForBars) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-50 mb-3">
              Activity
            </h3>
            <ActivityLog projectId={id} />
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
    </div>
  );
}
