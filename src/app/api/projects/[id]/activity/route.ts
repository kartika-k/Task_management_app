import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// Activity log for a project
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

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "20", 10);
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const pageSize =
      Number.isNaN(pageSizeParam) || pageSizeParam < 1 || pageSizeParam > 100
        ? 20
        : pageSizeParam;

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activityLog.count({ where: { projectId } }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error("Failed to fetch activity log:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}


