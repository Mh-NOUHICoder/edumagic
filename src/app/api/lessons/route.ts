import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[GET /api/lessons] Fetching inventory for user: ${userId}`);
    const lessons = await prisma.lesson.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    console.log(`[GET /api/lessons] Found ${lessons.length} pieces of wisdom.`);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Fetch User Lessons Error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}
