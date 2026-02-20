import { NextResponse } from 'next/server';
import { getApiKeys } from '@/lib/apiKeyManager';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prefixes = ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'GPT_API_KEY', 'RAPID_API_KEY'];
  const results: {
    name: string;
    prefix: string;
    maskedKey: string;
    fullKey: string;
    status: string;
  }[] = [];

  for (const prefix of prefixes) {
    const keys = getApiKeys(prefix);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const maskedKey = key.substring(0, 6) + '...' + key.substring(key.length - 4);
        const name = keys.length > 1 ? `${prefix}${i + 1}` : prefix;
        
        results.push({
            name,
            prefix,
            maskedKey,
            fullKey: key, // We'll test this on the server
            status: 'pending'
        });
    }
  }

  return NextResponse.json({ keys: results });
}

export async function POST(req: Request) {
    try {
        const { prefix, key } = await req.json();

        if (prefix.includes('OPENAI')) {
            try {
                const openai = new OpenAI({ apiKey: key });
                await openai.models.list();
                return NextResponse.json({ success: true, message: 'OpenAI key is valid!' });
            } catch (err: unknown) {
                const error = err as Error;
                return NextResponse.json({ success: false, message: error.message }, { status: 400 });
            }
        }

        if (prefix.includes('GEMINI')) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                // use gemini-3-flash for testing
                const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
                await model.generateContent("Hi");
                return NextResponse.json({ success: true, message: 'Gemini key is valid!' });
            } catch (err: unknown) {
                const error = err as Error;
                return NextResponse.json({ success: false, message: error.message }, { status: 400 });
            }
        }

        if (prefix.includes('RAPID') || prefix.includes('GPT')) {
            try {
                let host = prefix.includes('GPT') ? 'chatgpt-42.p.rapidapi.com' : 'hd-ai-image-gen-affordable-powerful.p.rapidapi.com';
                let url = prefix.includes('GPT') ? `https://${host}/texttoimage` : `https://${host}/image_gen`;

                // Try the primary host first, if it fails with 404 or auth, try the Midjourney ImagineCraft host
                let res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'x-rapidapi-key': key,
                        'x-rapidapi-host': host,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: 'test' })
                });

                if (!res.ok && !prefix.includes('GPT')) {
                    host = 'midjourney-imaginecraft-generative-ai-api.p.rapidapi.com';
                    url = `https://${host}/imagine`;
                    res = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'x-rapidapi-key': key,
                            'x-rapidapi-host': host,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ prompt: 'test' })
                    });
                }

                if (res.ok) {
                    return NextResponse.json({ success: true, message: 'RapidAPI key is valid!' });
                } else {
                    const text = await res.text();
                    return NextResponse.json({ success: false, message: `RapidAPI Error [${res.status}]: ${text.substring(0, 100)}` }, { status: 400 });
                }
            } catch (err: unknown) {
                const error = err as Error;
                return NextResponse.json({ success: false, message: error.message }, { status: 400 });
            }
        }

        return NextResponse.json({ success: false, message: 'Unknown key type' }, { status: 400 });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
