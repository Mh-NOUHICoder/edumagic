"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { toast } from "react-hot-toast";

export default function NewLesson() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { language } = useStore();
  const t = translations[language];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ topic, level, language }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate lesson");
      }

      const lesson = await res.json();
      toast.success("Magic unleashed! Your lesson is ready.", {
        icon: '✨',
      });
      router.push(`/lesson/${lesson.id}`);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "The magic failed! Please check your API key or try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-space transition-colors duration-500 overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="orb orb-cyan -top-40 -left-40" />
      <div className="orb orb-purple top-1/2 -right-60" />
      <div className="orb orb-pink -bottom-40 left-1/3" />

      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-24 px-6 relative z-10 min-h-screen pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 md:p-16 relative overflow-hidden bg-white/[0.03]"
          >
            {/* Inner Glow Decorative Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col items-center gap-6 mb-16">
              <div className="relative group">
                <div className="absolute -inset-4 bg-linear-to-r from-primary via-secondary to-accent rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700" />
                <div className="relative p-6 bg-bg-space rounded-[2rem] border border-white/10 shadow-premium">
                  <Sparkles className="text-primary w-14 h-14 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-black gradient-text tracking-tighter mb-2">
                  {t.summonNewLesson}
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI Powered Adventure</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-12">
              <div className="space-y-6">
                <label className="text-xl font-black tracking-tight flex items-center gap-3 text-white">
                  <span className="w-2 h-8 bg-primary rounded-full shadow-neon-blue" />
                  {t.learnQuestion}
                </label>

                {/* Magic Suggestions */}
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {Object.entries(t.topics).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTopic(value as string)}
                      className="px-5 py-2.5 text-xs font-black rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-105 text-slate-400 hover:text-white uppercase tracking-wider"
                    >
                       {value as string}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                   <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-20 transition duration-500" />
                    <input
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Molecular Biology, History of Rome..."
                      className="relative w-full bg-bg-space/50 border border-white/10 rounded-[1.5rem] px-8 py-6 text-xl font-bold outline-none focus:border-primary/50 transition-all placeholder:text-slate-700 text-text-main shadow-inner"
                    />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-xl font-black tracking-tight flex items-center gap-3 text-white">
                  <span className="w-2 h-8 bg-secondary rounded-full shadow-neon-purple" />
                  {t.difficultyLevel}
                </label>
                <div className="grid grid-cols-3 gap-5">
                  {["beginner", "intermediate", "advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`group relative py-5 rounded-2xl border transition-all duration-500 font-black capitalize overflow-hidden tracking-tight ${
                        level === lvl 
                          ? "border-secondary text-black shadow-neon-purple scale-105 bg-secondary" 
                          : "border-white/5 bg-white/5 hover:border-secondary/30 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <span className="relative z-10">{lvl}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full btn-magic relative h-24 text-2xl tracking-tighter group mt-8"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                  {loading ? t.magicInProgress : t.generateLesson}
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
