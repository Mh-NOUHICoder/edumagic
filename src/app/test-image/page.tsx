"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Image as ImageIcon, Sparkles, Wand2, ChevronDown, ChevronUp, RefreshCw, Terminal, Settings, ExternalLink, Send } from "lucide-react";

const PROVIDERS = [
  { id: 'chatgpt-42', name: 'ChatGPT-42 (Vetted)', status: 'Optimal', description: 'Confirmed working with GPT_API_KEY' },
  { id: 'hd-ai-image-gen', name: 'HD AI Image Gen (Premium)', status: 'Testing', description: 'Affordable & Powerful' },
  { id: 'hd-ai-image-gen-standard', name: 'HD AI Image Gen (Standard)', status: 'Testing', description: 'Variant Hostname' },
  { id: 'midjourney-imaginecraft', name: 'Midjourney ImagineCraft', status: 'Optimal', description: 'Subscribed & Tested (Premium)' },
  { id: 'pollinations', name: 'Pollinations', status: 'Fallback', description: 'No API Key required' },
];

const EXAMPLE_PROMPTS = [
  "Old village on Morocco with nature view",
  "A futuristic islamic city with golden domes and neon lights, cyberpunk style",
  "A majestic lion with a cosmic nebula mane, digital art",
  "Hyper-realistic portrait of a traditional nomad in the Atlas Mountains",
  "Cute robot librarian in a magical floating library"
];

interface ImageResult {
  imageUrl?: string;
  provider?: string;
  debugError?: string;
  error?: string;
  rawData?: unknown;
}

export default function TestImagePage() {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPTS[0]);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState('chatgpt-42');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showRaw, setShowRaw] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    addLog("💻 System initialized. Ready for diagnostics.");
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleTestGeneration = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setLogs([]);
    
    addLog(`🚀 Initializing generation using provider: ${provider}`);
    addLog(`📝 Prompt: "${prompt}"`);

    try {
      addLog("📡 Fetching /api/generate-image...");
      const startTime = Date.now();
      
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          apiKey: apiKey || undefined,
          provider 
        }),
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();
      let data: ImageResult = {};
      
      try {
        if (responseText) data = JSON.parse(responseText);
      } catch {
        addLog(`⚠️ Raw Response (Non-JSON): ${responseText.substring(0, 100)}`);
      }
      
      addLog(`⌛ Response received in ${duration}ms (Status: ${response.status})`);

      if (!response.ok) {
        const errorMsg = data.error || data.debugError || responseText || response.statusText;
        addLog(`❌ Error: ${errorMsg}`);
        setError(errorMsg);
        return;
      }

      addLog(`✅ Success! Received Image Data.`);
      if (data.imageUrl?.includes('154.12.252.57')) {
        addLog(`🌐 IP-based URL detected: ${data.imageUrl}`);
      }
      setResult(data);

      if (data.provider === 'pollinations' && provider !== 'pollinations') {
        addLog("⚠️ Warning: System fell back to Pollinations due to RapidAPI failure.");
      }

    } catch (err: unknown) {
      const errorObj = err as Error;
      console.error(errorObj);
      setError(errorObj.message || "An unknown error occurred");
      addLog(`💀 Exception: ${errorObj.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-8 md:p-12 shadow-2xl shadow-blue-500/5">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                                Diagnostic Center
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                <ImageIcon className="text-white" size={28} />
                            </div>
                            Neural Pipeline Lab
                        </h1>
                        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                            Fine-tune image generation engines. We currently support standard CDNs and IP-based image hosting (HTTP/154.12.x.x).
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-center min-w-[120px]">
                            <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Status</div>
                            <div className="text-emerald-400 font-bold">Operational</div>
                            <div className="text-[8px] text-slate-600 mt-1 uppercase tracking-widest">MJ Polling Active</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                        <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Settings size={14} className="text-blue-500" /> API Engine
                        </h2>
                        <div className="space-y-4">
                            {PROVIDERS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setProvider(p.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 relative group ${
                                        provider === p.id 
                                        ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20' 
                                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold text-sm ${provider === p.id ? 'text-white' : 'text-slate-300'}`}>{p.name}</span>
                                        {provider === p.id && <Sparkles size={12} className="text-blue-400 animate-pulse" />}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">{p.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                        <label className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-[0.2em]">Manual Key Override</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            placeholder="Optional: x-rapidapi-key"
                        />
                        <p className="mt-3 text-[10px] text-slate-600 italic leading-relaxed">
                            Used only for diagnostic session. Defaults to .env if empty.
                        </p>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                        <label className="text-xs font-bold text-slate-400 block mb-4 uppercase tracking-[0.2em]">Example Signal Prompts</label>
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLE_PROMPTS.map((ex, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(ex)}
                                    className="text-[10px] px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg hover:border-blue-500/40 hover:text-blue-300 transition-all text-slate-500 max-w-full truncate"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Send size={14} className="text-blue-500" /> Prompt Injection
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-white text-lg font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-800"
                            placeholder="Enter generation parameters..."
                        />
                        <button
                            onClick={handleTestGeneration}
                            disabled={loading || !prompt}
                            className={`w-full mt-6 py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all duration-500 ${
                                loading 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 active:scale-[0.98]'
                            }`}
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
                            {loading ? "Materializing Image..." : "Trigger API Pipeline"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Result View */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={14} className="text-purple-500" />
                                Canvas Output
                            </h3>
                            <div className="aspect-square bg-slate-950 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden relative group/canvas">
                                {/* Grid texture */}
                                <div className="absolute inset-0 opacity-10" style={{ 
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)',
                                    backgroundSize: '24px 24px'
                                }} />
                                
                                {loading && (
                                    <div className="flex flex-col items-center gap-4 z-10">
                                        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">Requesting...</span>
                                    </div>
                                )}

                                {!loading && error && (
                                    <div className="p-8 text-center z-10">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
                                            <AlertCircle size={32} />
                                        </div>
                                        <h4 className="text-red-400 font-black uppercase tracking-widest text-xs mb-2">Internal Error</h4>
                                        <p className="text-[10px] text-slate-500 font-mono break-all line-clamp-4 px-4">{error}</p>
                                    </div>
                                )}

                                {!loading && !error && result?.imageUrl && (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={result.imageUrl} 
                                            alt="Generation Result" 
                                            className="w-full h-full object-contain relative z-10 transition-transform duration-1000 group-hover/canvas:scale-105" 
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-8 translate-y-full group-hover/canvas:translate-y-0 transition-transform duration-500 z-20">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Source Pipeline</p>
                                                    <p className="text-[10px] text-white font-mono truncate">{result.imageUrl}</p>
                                                </div>
                                                <a 
                                                    href={result.imageUrl} 
                                                    target="_blank" 
                                                    className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
                                                >
                                                    <ExternalLink size={16} className="text-white" />
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {!loading && !error && !result?.imageUrl && (
                                    <div className="text-slate-800 flex flex-col items-center gap-4 opacity-20">
                                        <Wand2 size={64} />
                                        <span className="text-xs font-black uppercase tracking-[0.4em]">Standby</span>
                                    </div>
                                )}
                            </div>

                            {result && (
                              <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                                  <button 
                                    onClick={() => setShowRaw(!showRaw)} 
                                    className="w-full p-4 text-[10px] font-black text-slate-500 flex justify-between items-center transition-colors hover:text-slate-300 uppercase tracking-widest"
                                  >
                                      <span>RAW Metadata Inspection</span>
                                      {showRaw ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                  </button>
                                  {showRaw && (
                                    <div className="p-6 border-t border-slate-800/50 bg-black/40">
                                        <pre className="text-[9px] text-blue-400/80 overflow-x-auto max-h-60 leading-relaxed font-mono">
                                            {JSON.stringify(result.rawData || result, null, 2)}
                                        </pre>
                                    </div>
                                  )}
                              </div>
                            )}
                        </div>

                        {/* Console View */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} className="text-green-500" />
                                Neural Debug Console
                            </h3>
                            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 aspect-square overflow-y-auto flex flex-col-reverse shadow-inner relative">
                                {/* Scanline effect */}
                                <div className="absolute inset-0 pointer-events-none opacity-10 bg-scan" />
                                <div className="relative z-10 space-y-3">
                                    {logs.map((log, i) => (
                                        <div key={i} className="font-mono text-[10px] border-l-2 border-slate-800 pl-4 py-1.5 transition-all hover:bg-white/5 rounded-r-md">
                                            <span className={
                                                log.includes("❌") ? "text-red-400 font-bold" : 
                                                log.includes("✅") ? "text-emerald-400 font-bold" : 
                                                log.includes("⚠️") ? "text-amber-400 font-bold" :
                                                "text-blue-400/60"
                                            }>
                                                {log}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
