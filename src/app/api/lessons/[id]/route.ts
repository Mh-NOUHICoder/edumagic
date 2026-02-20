import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[GET /api/lessons/${id}] Fetching lesson archive...`);
    
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      console.warn(`[GET /api/lessons/${id}] Archive not found.`);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    console.log(`[GET /api/lessons/${id}] Materialization complete.`);
    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Fetch Lesson Error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
