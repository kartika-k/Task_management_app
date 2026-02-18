import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations";
import { getUserFromRequest } from "@/lib/auth";

// Get a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, taskId } = await params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, taskId } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: { project: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (user.role === "READ_ONLY" || existing.project.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: only the project owner can update tasks" },
        { status: 403 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      data.description = parsed.data.description;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
    if (parsed.data.dueDate !== undefined)
      data.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    const changedFields: string[] = [];
    const details: string[] = [];
    
    if (parsed.data.title && parsed.data.title !== existing.title) {
      changedFields.push(`Title: "${existing.title}" → "${task.title}"`);
    }
    if (
      parsed.data.description !== undefined &&
      parsed.data.description !== existing.description
    ) {
      const oldDesc = existing.description || "(empty)";
      const newDesc = parsed.data.description || "(empty)";
      changedFields.push(`Description: "${oldDesc.substring(0, 30)}" → "${newDesc.substring(0, 30)}"`);
    }
    if (parsed.data.status && parsed.data.status !== existing.status) {
      changedFields.push(`Status: ${existing.status} → ${task.status}`);
    }
    if (parsed.data.priority && parsed.data.priority !== existing.priority) {
      changedFields.push(`Priority: ${existing.priority} → ${task.priority}`);
    }
    if (parsed.data.dueDate !== undefined) {
      const nextDueDate = parsed.data.dueDate
        ? new Date(parsed.data.dueDate)
        : null;
      if (
        (existing.dueDate && !nextDueDate) ||
        (!existing.dueDate && nextDueDate) ||
        (existing.dueDate &&
          nextDueDate &&
          existing.dueDate.getTime() !== nextDueDate.getTime())
      ) {
        const oldDate = existing.dueDate ? new Date(existing.dueDate).toLocaleDateString() : "(none)";
        const newDate = nextDueDate ? new Date(nextDueDate).toLocaleDateString() : "(none)";
        changedFields.push(`Due Date: ${oldDate} → ${newDate}`);
      }
    }

    details.push(`Status: ${task.status}`);
    details.push(`Priority: ${task.priority}`);
    if (task.dueDate) {
      details.push(`Due Date: ${new Date(task.dueDate).toLocaleDateString()}`);
    }

    if (changedFields.length > 0) {
      await prisma.activityLog.create({
        data: {
          projectId,
          taskId,
          action: "TASK_UPDATED",
          message: `Task "${task.title}" updated - ${changedFields.join("; ")}. Current: ${details.join(", ")}`,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, taskId } = await params;

    const existing = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: { project: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (user.role === "READ_ONLY" || existing.project.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: only the project owner can delete tasks" },
        { status: 403 }
      );
    }

    const details: string[] = [];
    details.push(`Status: ${existing.status}`);
    details.push(`Priority: ${existing.priority}`);
    if (existing.dueDate) {
      details.push(`Due Date: ${new Date(existing.dueDate).toLocaleDateString()}`);
    }
    if (existing.description) {
      details.push(`Description: ${existing.description.substring(0, 50)}${existing.description.length > 50 ? '...' : ''}`);
    }

    await prisma.activityLog.create({
      data: {
        projectId,
        taskId,
        action: "TASK_DELETED",
        message: `Task "${existing.title}" deleted (${details.join(", ")})`,
      },
    });

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
