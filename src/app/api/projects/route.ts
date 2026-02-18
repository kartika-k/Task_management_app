import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "READ_ONLY") {
      return NextResponse.json(
        { error: "Forbidden: read-only users cannot create projects" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        ownerId: user.id,
      },
    });

    // Create detailed activity log entry
    const details: string[] = [];
    if (project.description) {
      details.push(`Description: ${project.description.substring(0, 50)}${project.description.length > 50 ? '...' : ''}`);
    }
    const message = details.length > 0 
      ? `Project "${project.name}" created (${details.join(", ")})`
      : `Project "${project.name}" created`;
    
    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        action: "PROJECT_CREATED",
        message,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
