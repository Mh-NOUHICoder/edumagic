import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { withKeyRotation } from "./apiKeyManager";

export async function generateLesson(topic: string, level: string, language: string) {
  const prompt = `Act as an expert teacher creating a "Guided Learning Journey" for a student.
  Topic: "${topic}"
  Level: "${level}"
  Language: ${language}

  Instructions:
  1. Break the lesson into small, logical steps (5-8 steps). Each step must teach one core concept thoroughly.
  2. For each step:
     - Provide a clear, engaging explanation (Markdown).
     - Include a "visual_description" which is a detailed prompt describing an image or diagram that explains this specific step.
     - Include a "concept_check" (1 multiple choice question) to verify understanding before moving to the next step.
  3. Ensure the tone is friendly, encouraging, and uses simple analogies.
  4. The ENTIRE response must be in ${language}.

  Format the response as a valid JSON object:
  {
    "introduction": "Brief, exciting hook for the lesson...",
    "introduction_visual": "Detailed cinematic prompt for the main cover image of this lesson",
    "steps": [
      {
        "title": "Clear step title",
        "explanation": "Engaging explanation using Markdown...",
        "visual_description": "Detailed prompt for an image generator (in English for better results, but explanation must be in ${language})",
        "quiz": {
          "question": "Comprehension question",
          "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
          "answer": "The correct option string",
          "hint": "Helpful tip"
        }
      }
    ],
    "summary": "Quick recap of the main points",
    "final_motivation": "Inspiring closing line"
  }
  
  Return ONLY the JSON object.`;

  try {
    // Try OpenAI first with rotation
    return await withKeyRotation("OPENAI_API_KEY", async (key) => {
      const openai = new OpenAI({ apiKey: key });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      
      const rawContent = response.choices[0].message.content || "{}";
      try {
        return JSON.parse(rawContent);
      } catch (parseError) {
        console.error("OpenAI JSON Parse Error:", parseError);
        throw parseError; // This will trigger fallback if OpenAI itself returns bad JSON
      }
    });
  } catch (error) {
    console.error("OpenAI exhausted or failed, falling back to Gemini:", error);
    
    // Fallback to Gemini with rotation
    try {
      return await withKeyRotation("GEMINI_API_KEY", async (key) => {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const contentText = response.text();
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        const cleanedText = jsonMatch ? jsonMatch[0] : contentText.replace(/```json|```/g, "").trim();
        try {
          return JSON.parse(cleanedText);
        } catch (geminiParseError) {
          console.error("Gemini JSON Parse Error:", geminiParseError);
          throw geminiParseError;
        }
      });
    } catch (geminiError) {
      console.error("Combined AI Error:", geminiError);
      throw new Error("All AI models and keys failed. Please check your API keys or quota.");
    }
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
    return await withKeyRotation("OPENAI_API_KEY", async (key) => {
      const openai = new OpenAI({ apiKey: key });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content;
    });
  } catch (error) {
    console.error("OpenAI Error (Darija), falling back to Gemini:", error);
    try {
      return await withKeyRotation("GEMINI_API_KEY", async (key) => {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });
    } catch (err) {
      console.error("All AI sources for Darija failed:", err);
      return "Oups! Sma7 lia, t3ksat lia l'magie chno bghiti t3rf?";
    }
  }
}
