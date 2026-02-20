import { NextResponse } from 'next/server';
import { withKeyRotation } from '@/lib/apiKeyManager';

// Opt-out of caching for this route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let prompt = '';
  
  try {
    const body = await req.json();
    prompt = body.prompt;
    const customApiKey = body.apiKey;
    const provider = body.provider || 'midjourney-imaginecraft';

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Default Fallback Generator (The "Default Image")
    const getFallback = async (msg: string = "All generators failed") => {
        return { 
            imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80", // High-quality educational books
            provider: 'default-educational',
            warning: `${msg}. Displaying a high-quality educational visual instead.`
        };
    };

    // If explicit fallback requested
    if (provider === 'pollinations' || provider === 'lexica') {
        const fallback = await getFallback("Lexica requested or Pollinations deprecated.");
        return NextResponse.json(fallback);
    }

    // If a custom API key is provided, use it directly without rotation
    if (customApiKey) {
        try {
            const result = await attemptGeneration(provider, prompt, customApiKey);
            return NextResponse.json(result);
        } catch (err: unknown) {
            const error = err as Error;
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // Determine key prefix based on provider
    const keyPrefix = provider === 'chatgpt-42' ? 'GPT_API_KEY' : 'RAPID_API_KEY';

    try {
        // Execute generation with automatic key rotation
        const result = await withKeyRotation(keyPrefix, async (key) => {
            return await attemptGeneration(provider, prompt, key);
        });
        return NextResponse.json(result);
    } catch (err: unknown) {
        const error = err as Error;
        console.error(`All keys for ${provider} failed, falling back to Lexica Art:`, error.message);
        return NextResponse.json(await getFallback(`Service ${provider} unavailable: ${error.message}`));
    }

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Core Logic Error:', err.message || err);
    return NextResponse.json({ 
        error: err.message || "Unknown error",
        provider: 'error'
    }, { status: 500 });
  }
}

async function attemptGeneration(provider: string, prompt: string, apiKey: string) {
    let apiHost = '';
    let apiUrl = '';
    let apiBody: Record<string, unknown> = {};

    if (provider === 'chatgpt-42') {
        apiHost = 'chatgpt-42.p.rapidapi.com';
        apiUrl = `https://${apiHost}/texttoimage`;
        apiBody = { text: prompt, width: 1024, height: 1024 };
    } else if (provider === 'hd-ai-image-gen') {
        apiHost = 'hd-ai-image-gen-affordable-powerful.p.rapidapi.com';
        apiUrl = `https://${apiHost}/image_gen`;
        apiBody = { text: prompt, prompt: prompt, width: 1024, height: 1024 };
    } else if (provider === 'hd-ai-image-gen-standard') {
        apiHost = 'hd-ai-image-gen.p.rapidapi.com';
        apiUrl = `https://${apiHost}/image_gen`;
        apiBody = { prompt: prompt, width: 1024, height: 1024 };
    } else if (provider === 'midjourney-imaginecraft') {
        apiHost = 'midjourney-imaginecraft-generative-ai-api.p.rapidapi.com';
        
        // Strategy: Probing - try /imagine first
        const endpoints = [`https://${apiHost}/imagine`, `https://${apiHost}/mj_imagine` ];
        let lastErr = "";
        
        for (const url of endpoints) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-rapidapi-key': apiKey,
                        'x-rapidapi-host': apiHost
                    },
                    body: JSON.stringify({ prompt: prompt }),
                    cache: 'no-store'
                });

                const status = res.status;
                const text = await res.text();
                
                if (res.ok) {
                    const data = JSON.parse(text);
                    // Check if image is immediate
                    const imageUrl = data.generated_image || data.image_url || data.url || data.image || data.imageUrl;
                    
                    if (imageUrl) return { imageUrl, provider, rawData: data };

                    // ASYNC POLLING: If we got a job ID but no image yet
                    const jobId = data.id || data.job_id || data.task_id || data.messageId;
                    if (jobId) {
                        const pollUrls = [
                            `https://${apiHost}/fetch_result?id=${jobId}`,
                            `https://${apiHost}/result?id=${jobId}`,
                            `https://${apiHost}/get_image?id=${jobId}`
                        ];
                        
                        // Wait/Poll for up to 30 seconds
                        for (let i = 0; i < 10; i++) {
                            await new Promise(r => setTimeout(r, 3000)); // 3s interval
                            
                            for (const pollUrl of pollUrls) {
                                try {
                                    const pollRes = await fetch(pollUrl, {
                                        headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': apiHost }
                                    });
                                    
                                    if (pollRes.ok) {
                                        const pollData = await pollRes.json();
                                        const foundUrl = pollData.generated_image || pollData.image_url || pollData.url || pollData.image || pollData.imageUrl || (pollData.data && pollData.data[0]?.url);
                                        if (foundUrl) return { imageUrl: foundUrl, provider, rawData: pollData };
                                    }
                                } catch {
                                    // Silent fail for individual poll attempts
                                }
                            }
                        }
                    }
                }
                lastErr = `Endpoint ${url} responded with ${status}: ${text}`;
            } catch (e: unknown) {
                lastErr = (e as Error).message;
            }
        }
        throw new Error(`Midjourney Probing Failed. Last Status: ${lastErr}. Hint: Check subscription status on RapidAPI.`);
    } else {
        throw new Error(`Unknown provider ${provider}`);
    }

    // Standard execution for other providers
    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost
        },
        body: JSON.stringify(apiBody),
        cache: 'no-store'
    });

    const status = apiResponse.status;
    const responseText = await apiResponse.text();
    
    if (status === 429) {
        const error = new Error("Rate limit exceeded") as Error & { status: number };
        error.status = 429;
        throw error;
    }

    interface ApiResponse {
        generated_image?: string;
        image_url?: string;
        url?: string;
        image?: string;
        imageUrl?: string;
        result?: string;
        data?: Array<{ url: string }>;
        id?: string | number;
        job_id?: string | number;
        task_id?: string | number;
        messageId?: string | number;
        content?: string;
        filename?: string;
        [key: string]: unknown;
    }

    let data: ApiResponse = {};
    try {
        if (responseText) data = JSON.parse(responseText);
    } catch { 
        throw new Error(`Invalid JSON response from ${provider}: ${responseText.substring(0, 100)}`);
    }

    if (!apiResponse.ok) {
        throw new Error(`RapidAPI Error [${status}]: ${responseText}`);
    }

    let finalUrl = data.generated_image || 
                   data.image_url || 
                   data.url || 
                   data.image || 
                   data.imageUrl || 
                   data.result ||
                   (data.data && Array.isArray(data.data) && data.data[0]?.url);

    if (!finalUrl && (provider.includes('hd-ai-image-gen'))) {
        const idValue = data.id || data.content || data.filename;
        if (idValue) {
            const cleanId = idValue.toString().trim();
            finalUrl = `http://154.12.252.57:4000/images/${cleanId}${cleanId.includes('.') ? '' : '.png'}`;
        }
    }

    if (finalUrl) {
        // Handle base64 strings that might be missing the data:image prefix
        if (finalUrl.length > 1000 && !finalUrl.startsWith('http') && !finalUrl.startsWith('data:')) {
            finalUrl = `data:image/png;base64,${finalUrl}`;
        }

        const isIpAddress = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(finalUrl);
        if (finalUrl.startsWith('http://') && !isIpAddress) {
            finalUrl = finalUrl.replace('http://', 'https://');
        }

        return { imageUrl: finalUrl, provider, rawData: data };
    }

    throw new Error(`Empty response format from ${provider}`);
}
