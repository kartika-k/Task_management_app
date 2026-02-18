import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations";
import { getUserFromRequest } from "@/lib/auth";

//  Get a single project 
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (user.role === "READ_ONLY" || existing.ownerId !== user.id) {
      return NextResponse.json(
        { error: "only the project owner can edit this project" },
        { status: 403 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    const changedFields: string[] = [];
    if (parsed.data.name && parsed.data.name !== existing.name) {
      changedFields.push(`Name: "${existing.name}" → "${parsed.data.name}"`);
    }
    if (parsed.data.description !== undefined && parsed.data.description !== existing.description) {
      const oldDesc = existing.description || "(empty)";
      const newDesc = parsed.data.description || "(empty)";
      changedFields.push(`Description: "${oldDesc.substring(0, 30)}" → "${newDesc.substring(0, 30)}"`);
    }
    
    const message = changedFields.length > 0
      ? `Project "${project.name}" updated - ${changedFields.join("; ")}`
      : `Project "${project.name}" updated`;
    
    await prisma.activityLog.create({
      data: {
        projectId: id,
        action: "PROJECT_UPDATED",
        message,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (user.role === "READ_ONLY" || existing.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: only the project owner can delete this project" },
        { status: 403 }
      );
    }
    const projectName = existing.name;
    const projectDescription = existing.description ? `Description: ${existing.description.substring(0, 50)}${existing.description.length > 50 ? '...' : ''}` : '';
    const details = projectDescription ? `(${projectDescription})` : '';
    
    try {
      await prisma.activityLog.create({
        data: {
          projectId: id,
          action: "PROJECT_DELETED",
          message: `Project "${projectName}" deleted ${details}`,
        },
      });
    } catch (logError) {
      console.error("Failed to create deletion log:", logError);
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
