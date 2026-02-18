import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, stepIndex } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Fetch the lesson to update its JSON content
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Update the JSON content
    // Update the JSON content
    interface LessonContent {
        steps?: Array<{ imageUrl?: string }>;
        quizzes?: Array<{ imageUrl?: string }>;
        introductionImageUrl?: string;
    }

    const content = lesson.content as unknown as LessonContent;
    
    // Check if it's the new format with steps
    if (content && content.steps && Array.isArray(content.steps) && typeof stepIndex === 'number' && content.steps[stepIndex]) {
        content.steps[stepIndex].imageUrl = imageUrl;
    } else if (stepIndex === -1) {
        // Special case for introduction/top-level image
        content.introductionImageUrl = imageUrl;
    } else if (content && content.quizzes && Array.isArray(content.quizzes) && typeof stepIndex === 'number' && content.quizzes[stepIndex]) {
        // Legacy support
        content.quizzes[stepIndex].imageUrl = imageUrl;
    }

    // Save back to DB
    await prisma.lesson.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { content: content as any },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Update Lesson Image Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update lesson" }, { status: 500 });
  }
}
