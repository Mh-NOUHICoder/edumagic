import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { withKeyRotation } from "./apiKeyManager";

const LEVEL_CONTEXT = {
  beginner: {
    depth: "Assume ZERO prior knowledge. Use very simple language, everyday analogies, and avoid jargon. Focus on the 'what' and 'why'. Build a solid mental model from scratch.",
    steps: "5-6 steps",
    quiz_style: "simple recognition and recall questions",
    resources_style: "beginner-friendly YouTube videos, simple articles, and introductory books",
  },
  intermediate: {
    depth: "Assume the student knows the basics. Go deeper into the 'how'. Introduce technical terms with clear definitions. Cover edge cases, common mistakes, and practical patterns. Build on prior knowledge explicitly.",
    steps: "6-7 steps",
    quiz_style: "application and comprehension questions that require understanding, not just recall",
    resources_style: "official documentation, intermediate tutorials, practice projects, and technical blogs",
  },
  advanced: {
    depth: "Assume strong foundational knowledge. Explore the 'why it works this way' at a deep level. Cover internals, performance, trade-offs, design patterns, and expert-level nuances. Challenge assumptions.",
    steps: "7-8 steps",
    quiz_style: "analysis and synthesis questions requiring critical thinking and expert judgment",
    resources_style: "research papers, advanced books, source code repositories, conference talks, and expert blogs",
  },
};

export async function generateLesson(topic: string, level: string, language: string) {
  const levelKey = level.toLowerCase().includes("beginner")
    ? "beginner"
    : level.toLowerCase().includes("intermediate")
    ? "intermediate"
    : "advanced";

  const ctx = LEVEL_CONTEXT[levelKey as keyof typeof LEVEL_CONTEXT] || LEVEL_CONTEXT.beginner;

  const prompt = `You are a world-class AI educator and deep research specialist. Your task is to create a comprehensive, level-calibrated "Guided Learning Journey".

TOPIC: "${topic}"
LEVEL: "${level}"
LANGUAGE: ${language}

LEVEL CALIBRATION RULES (CRITICAL - follow exactly):
- ${ctx.depth}
- Number of steps: ${ctx.steps}
- Quiz style: ${ctx.quiz_style}
- Resources style: ${ctx.resources_style}

CONTENT REQUIREMENTS:
1. Each step must teach ONE distinct concept, going progressively deeper.
2. Steps must be UNIQUE and NOT repeat information from other steps.
3. For ${level} level, the complexity, vocabulary, and depth MUST be appropriate — do NOT reuse beginner content for intermediate/advanced.
4. Include real-world applications and concrete examples at the appropriate level.
5. The ENTIRE response (except visual_description and resource URLs) must be in ${language}.

Format the response as a valid JSON object with this EXACT structure:
{
  "introduction": "A compelling hook that acknowledges the student's current level and what they will master",
  "introduction_visual": "Detailed cinematic English prompt for a cover image representing this topic at ${level} level",
  "key_concepts": ["concept1", "concept2", "concept3", "concept4"],
  "steps": [
    {
      "title": "Step title",
      "explanation": "Rich explanation using Markdown with **bold**, bullet points, and code blocks where relevant",
      "visual_description": "Detailed English prompt for an educational diagram/illustration for this specific concept",
      "real_world": "A concrete real-world example or application of this concept at ${level} level",
      "resources": [
        {
          "type": "video",
          "title": "Specific video for this step",
          "description": "Short explanation of why this video helps with THIS step",
          "url": "https://www.youtube.com/results?search_query=[specific+topic+search]",
          "difficulty": "${level}"
        },
        {
          "type": "article",
          "title": "Deep dive article",
          "url": "https://www.google.com/search?q=[specific+topic+article+search]",
          "difficulty": "${level}"
        }
      ],
      "quiz": {
        "question": "A ${ctx.quiz_style} question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The exact correct option string",
        "hint": "A helpful hint that guides without giving away the answer",
        "explanation": "Brief explanation of WHY the answer is correct"
      }
    }
  ],
  "summary": "Concise recap of all key points covered",
  "final_motivation": "Inspiring, level-appropriate closing message",
  "resources": [
    {
      "type": "video",
      "title": "Resource title",
      "description": "Why this resource is perfect for ${level} learners of this topic",
      "url": "https://www.youtube.com/results?search_query=[topic+tutorial]",
      "difficulty": "${level}"
    },
    {
      "type": "article",
      "title": "Resource title",
      "description": "Brief description",
      "url": "https://www.google.com/search?q=[topic+advanced+guide]",
      "difficulty": "${level}"
    }
  ]
}

Return ONLY the JSON object. No markdown fences, no extra text. 
CRITICAL URL RULE: Provide REAL, functional, and specific links. If you don't know a specific URL, provide a HIGHLY TARGETED search URL (e.g., https://www.youtube.com/results?search_query=specific+topic+name). NEVER return placeholders like "https://youtube.com/" or bracketed text like "[topic]". Every URL must be a complete, valid string that works in a browser immediately.`;

  try {
    return await withKeyRotation("GEMINI_API_KEY", async (key) => {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const contentText = response.text();
      
      if (!contentText) {
          throw new Error("Gemini returned an empty response");
      }

      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      const cleanedText = jsonMatch
        ? jsonMatch[0]
        : contentText.replace(/```json|```/g, "").trim();
      
      try {
          return JSON.parse(cleanedText);
      } catch {
          console.error("Gemini JSON parse failed. Content:", contentText.substring(0, 100));
          throw new Error("AI produced invalid content format. Please try again.");
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Gemini Error:", err.message || err);
    throw new Error(err.message || "Gemini AI failed. Please check your API keys or quota.");
  }
}

export async function explainInDarija(text: string) {
  const prompt = `Act as a cool, friendly Moroccan "Darija Buddy". 
  User says: "${text}"
  
  Your goal is to explain educational concepts or respond to the user in a very casual, helpful, and "Moroccan street-smart" way using Moroccan Darija.
  - Use words like "khoya/khti", "sat", "buddy", "mousalsal", "fhamti".
  - Keep it encouraging and funny.
  - If the user asks for an explanation, break it down using real-life Moroccan analogies (e.g., using "hanout", "taxi", "football").
  - Use Latin characters (Arabizi/Darija with numbers) or Arabic script depending on how you feel vibe-wise, but keep it very readable.
  
  Respond directly as the buddy. No preamble.`;

  try {
    return await withKeyRotation("GEMINI_API_KEY", async (key) => {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });
  } catch (err) {
    console.error("Gemini sources for Darija failed:", err);
    return "Oups! Sma7 lia, t3ksat lia l'magie chno bghiti t3rf?";
  }
}
