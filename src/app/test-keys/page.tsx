"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Key, 
  Zap,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface APIKeyStatus {
  name: string;
  prefix: string;
  maskedKey: string;
  fullKey: string;
  status: 'pending' | 'testing' | 'valid' | 'invalid';
  message?: string;
}

export default function TestKeysPage() {
  const [keys, setKeys] = useState<APIKeyStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/test-keys');
      const data = await res.json();
      setKeys(data.keys);
    } catch {
      toast.error("Failed to load keys from environment.");
    } finally {
      setIsLoading(false);
    }
  };

  const testKey = async (index: number) => {
    const keyToTest = keys[index];
    
    setKeys(prev => prev.map((k, i) => i === index ? { ...k, status: 'testing' } : k));

    try {
      const res = await fetch('/api/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: keyToTest.prefix, key: keyToTest.fullKey })
      });

      const data = await res.json();

      setKeys(prev => prev.map((k, i) => i === index ? { 
        ...k, 
        status: data.success ? 'valid' : 'invalid',
        message: data.message
      } : k));

      if (data.success) {
        toast.success(`${keyToTest.name} is working!`);
      } else {
        toast.error(`${keyToTest.name} failed: ${data.message}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setKeys(prev => prev.map((k, i) => i === index ? { 
        ...k, 
        status: 'invalid',
        message: error.message
      } : k));
    }
  };

  const testAll = async () => {
    setIsRotating(true);
    for (let i = 0; i < keys.length; i++) {
      await testKey(i);
    }
    setIsRotating(false);
  };

  return (
    <div className="min-h-screen bg-bg-space transition-colors duration-500 overflow-x-hidden overflow-y-auto">
      <Navbar />
      <Sidebar />

      <main className="lg:ml-64 pt-24 px-4 md:px-8 pb-20 relative z-10">
        {/* Animated Background Orbs */}
        <div className="orb orb-cyan -top-40 -left-20 opacity-30" />
        <div className="orb orb-purple top-1/2 -right-40 opacity-20" />

        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
              >
                <Lock className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Key Management Terminal</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-black text-white tracking-tighter italic"
              >
                API <span className="gradient-text">Diagnostics</span>
              </motion.h1>
              <p className="text-slate-500 mt-2 font-medium">Verify your neural connections and API quotas in real-time.</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testAll}
              disabled={isRotating || keys.length === 0}
              className="btn-magic flex items-center gap-3 px-8 py-4 disabled:opacity-50"
            >
              <RefreshCcw className={`w-5 h-5 text-black ${isRotating ? 'animate-spin' : ''}`} />
              <span className="font-black tracking-tight">Sync All Keys</span>
            </motion.button>
          </div>

          {/* Key Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Activity className="w-12 h-12 animate-pulse text-primary" />
              <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">Scanning Environment Variables...</p>
            </div>
          ) : keys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {keys.map((key, idx) => (
                  <motion.div
                    key={`${key.name}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`glass-card p-6 border-white/5 relative overflow-hidden group ${
                      key.status === 'valid' ? 'border-primary/20' : 
                      key.status === 'invalid' ? 'border-red-500/20' : ''
                    }`}
                  >
                    {/* Status Glow */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-colors ${
                      key.status === 'valid' ? 'bg-primary' : 
                      key.status === 'invalid' ? 'bg-red-500' : 'bg-slate-500'
                    }`} />

                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-xl ${
                        key.prefix.includes('OPENAI') ? 'bg-emerald-500/10 text-emerald-500' :
                        key.prefix.includes('GEMINI') ? 'bg-blue-500/10 text-blue-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {key.prefix.includes('OPENAI') ? <Zap className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {key.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        {key.status === 'invalid' && <XCircle className="w-5 h-5 text-red-500" />}
                        {key.status === 'testing' && <RefreshCcw className="w-5 h-5 text-primary animate-spin" />}
                        {key.status === 'pending' && <Activity className="w-5 h-5 text-slate-700" />}
                        
                        <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${
                            key.status === 'valid' ? 'text-primary' : 
                            key.status === 'invalid' ? 'text-red-500' : 'text-slate-500'
                        }`}>
                          {key.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 italic tracking-tight">{key.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-6 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                        <Key className="w-3 h-3 text-slate-500" />
                        <code className="text-[10px] text-slate-400 font-mono tracking-wider">{key.maskedKey}</code>
                    </div>

                    {key.message && (
                        <p className={`text-[10px] mb-6 p-2 rounded bg-black/20 font-medium ${
                            key.status === 'invalid' ? 'text-red-400' : 'text-slate-500'
                        }`}>
                            {key.message}
                        </p>
                    )}

                    <button
                      onClick={() => testKey(idx)}
                      disabled={key.status === 'testing'}
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                        key.status === 'valid' 
                          ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' 
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {key.status === 'testing' ? 'Verifying...' : 'Test Connection'}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-40 glass-card border-dashed border-white/5">
              <AlertTriangle className="w-12 h-12 text-yellow-500/50 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white mb-2">No API Keys Detected</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">
                We couldn&apos;t find any recognized API keys in your .env file. Add keys to START the magic.
              </p>
              <div className="bg-black/40 p-4 rounded-xl text-left max-w-md mx-auto border border-white/5">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2">Required Format:</p>
                <code className="text-xs text-slate-400 font-mono">
                  OPENAI_API_KEY=... <br />
                  GEMINI_API_KEY=... <br />
                  RAPID_API_KEY=...
                </code>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
