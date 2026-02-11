"use client";

import { Task } from "@/lib/types";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
}

const statusColors: Record<Task["status"], string> = {
  TODO: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const statusLabels: Record<Task["status"], string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const priorityColors: Record<Task["priority"], string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

const priorityLabels: Record<Task["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        isOverdue ? "border-red-300" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3
              className={`font-medium ${
                task.status === "DONE" ? "line-through text-muted" : ""
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                statusColors[task.status]
              }`}
            >
              {statusLabels[task.status]}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                priorityColors[task.priority]
              }`}
            >
              {priorityLabels[task.priority]}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-muted line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted">
            {task.dueDate && (
              <span className={isOverdue ? "text-danger font-medium" : ""}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && " (overdue)"}
              </span>
            )}
            <span>
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <select
            value={task.status}
            onChange={(e) =>
              onStatusChange(task.id, e.target.value as Task["status"])
            }
            className="text-xs border border-border rounded px-2 py-1 bg-white"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-muted hover:text-foreground px-2 py-1 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-danger hover:text-danger-hover px-2 py-1 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
