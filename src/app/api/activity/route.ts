import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/activity -  activity across all projects for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "20", 10);
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const pageSize =
      Number.isNaN(pageSizeParam) || pageSizeParam < 1 || pageSizeParam > 100
        ? 20
        : pageSizeParam;

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          project: {
            ownerId: user.id,
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activityLog.count({
        where: {
          project: {
            ownerId: user.id,
          },
        },
      }),
    ]);

    const mapped = items.map((entry) => ({
      id: entry.id,
      projectId: entry.projectId,
      taskId: entry.taskId,
      action: entry.action,
      message: entry.message,
      createdAt: entry.createdAt,
      projectName: entry.project?.name || null,
    }));

    return NextResponse.json({ items: mapped, total, page, pageSize });
  } catch (error) {
    console.error("Failed to fetch global activity log:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}


