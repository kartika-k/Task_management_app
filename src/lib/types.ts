export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTasks {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ActivityLogEntry {
  id: string;
  projectId: string;
  taskId: string | null;
  action: string;
  message: string;
  createdAt: string;
  projectName?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "READ_ONLY" | "EDITOR";
}
