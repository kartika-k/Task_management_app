import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";

// List tasks with filtering and sorting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const where: Prisma.TaskWhereInput = { projectId };

    const statusParam = searchParams.get("status");
    if (statusParam) {
      const statuses = statusParam.split(",").filter(Boolean);
      const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
      const filtered = statuses.filter((s) => validStatuses.includes(s));
      if (filtered.length > 0) {
        where.status = { in: filtered as ("TODO" | "IN_PROGRESS" | "DONE")[] };
      }
    }
    const priorityParam = searchParams.get("priority");
    if (priorityParam) {
      const priorities = priorityParam.split(",").filter(Boolean);
      const validPriorities = ["LOW", "MEDIUM", "HIGH"];
      const filtered = priorities.filter((p) => validPriorities.includes(p));
      if (filtered.length > 0) {
        where.priority = { in: filtered as ("LOW" | "MEDIUM" | "HIGH")[] };
      }
    }

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "10", 10);
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const pageSize =
      Number.isNaN(pageSizeParam) || pageSizeParam < 1 || pageSizeParam > 100
        ? 10
        : pageSizeParam;

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const validSortFields = ["createdAt", "dueDate", "priority", "status"];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      items: tasks,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
// Create a task by project id
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (user.role === "READ_ONLY" || project.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: only the project owner can create tasks" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status: parsed.data.status ?? "TODO",
        priority: parsed.data.priority ?? "MEDIUM",
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
    });

    const details: string[] = [];
    details.push(`Status: ${task.status}`);
    details.push(`Priority: ${task.priority}`);
    if (task.dueDate) {
      details.push(`Due Date: ${new Date(task.dueDate).toLocaleDateString()}`);
    }
    if (task.description) {
      details.push(`Description: ${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}`);
    }
    
    await prisma.activityLog.create({
      data: {
        projectId,
        taskId: task.id,
        action: "TASK_CREATED",
        message: `Task "${task.title}" created (${details.join(", ")})`,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
