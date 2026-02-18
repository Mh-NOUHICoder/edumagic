import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { REWARDS } from "@/utils/gamification";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, score } = await req.json();

    // Lazy Sync: Ensure user exists in local DB
    const email = user.emailAddresses[0]?.emailAddress;
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser && email) {
      // Handle existing email with different ID
      dbUser = await prisma.user.findUnique({
        where: { email },
      });

      if (dbUser) {
        dbUser = await prisma.user.update({
          where: { email },
          data: { id: userId },
        });
      } else {
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

    const xpEarned = REWARDS.LESSON_COMPLETE + (score * REWARDS.QUIZ_CORRECT);
    const totalXp = (dbUser?.xp || 0) + xpEarned;
    const newLevel = Math.floor(totalXp / 500) + 1;

    const progress = await prisma.progress.create({
      data: {
        userId,
        lessonId,
        score,
        xpEarned,
      },
      include: {
        lesson: {
          select: {
            topic: true
          }
        }
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: totalXp,
        level: newLevel,
      },
    });

    return NextResponse.json({
      ...progress,
      totalXp,
      level: newLevel,
      xpEarned
    });
  } catch (error) {
    console.error("Progress Tracker Error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: {
          take: 5,
          orderBy: { completedAt: "desc" },
          include: {
            lesson: {
              select: { topic: true }
            }
          }
        },
        badges: {
          include: { badge: true }
        }
      }
    });

    if (!dbUser) {
      // Return a default state for a new user who hasn't been created in DB yet
      return NextResponse.json({
        id: userId,
        xp: 0,
        level: 1,
        streak: 0,
        progress: [],
        badges: []
      });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Fetch Progress Error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
