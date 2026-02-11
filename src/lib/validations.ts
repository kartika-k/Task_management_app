import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional().nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255, "Title too long"),
  description: z.string().max(2000, "Description too long").optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(255, "Title too long")
    .optional(),
  description: z.string().max(2000, "Description too long").optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
