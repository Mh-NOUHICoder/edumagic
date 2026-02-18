import { NextResponse } from "next/server";
import { explainInDarija } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const explanation = await explainInDarija(text);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Darija API Error:", error);
    return NextResponse.json({ error: "Failed to explain in Darija" }, { status: 500 });
  }
}
