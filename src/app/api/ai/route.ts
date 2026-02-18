import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateLesson } from "@/lib/openai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lazy Sync: Ensure user exists in local DB
    const email = user.emailAddresses[0]?.emailAddress;
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser && email) {
      // Check if user exists by email (to handle ID changes/migration)
      dbUser = await prisma.user.findUnique({
        where: { email },
      });

      if (dbUser) {
        // Update existing user with new Clerk ID
        dbUser = await prisma.user.update({
          where: { email },
          data: { id: userId },
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            id: userId,
            email: email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Student",
            role: "student",
          },
        });
      }
    }

    const { topic, level, language } = await req.json();

    if (!topic || !level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const content = await generateLesson(topic, level, language || "en");

    const lesson = await prisma.lesson.create({
      data: {
        topic: topic,
        content,
        level,
        userId: userId, // Using Clerk's userId directly
      },
    });

    return NextResponse.json(lesson);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI Generation Error details:", err.message || err);
    return NextResponse.json(
      { error: `Failed to generate lesson: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
