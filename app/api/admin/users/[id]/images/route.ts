import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [images, total] = await Promise.all([
    prisma.image.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        imageUrl: true,
        thumbnailUrl: true,
        width: true,
        height: true,
        createdAt: true,
      },
    }),
    prisma.image.count({ where: { userId: id } }),
  ]);

  return NextResponse.json({
    images,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
