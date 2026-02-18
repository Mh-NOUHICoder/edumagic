"use client";

import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Lesson {
  id: string;
  topic: string;
  level: string;
  createdAt: string;
}

export default function MyLessons() {
  const { language } = useStore();
  const t = translations[language];
  const [search, setSearch] = useState("");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["userLessons"],
    queryFn: async () => {
      const res = await fetch("/api/lessons");
      if (!res.ok) {
        toast.error("The archives are currently inaccessible.");
        throw new Error("Failed to fetch lessons");
      }
      return res.json() as Promise<Lesson[]>;
    }
  });

  const filteredLessons = lessons?.filter(lesson => 
    lesson.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-space transition-colors duration-500 overflow-x-hidden overflow-y-auto relative">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-64 pt-20 md:pt-24 px-4 md:px-8 pb-20 relative z-10">
        {/* Background Ornaments */}
        <div className="orb orb-cyan -top-40 -left-20" />
        <div className="orb orb-purple top-1/2 -right-40" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 mb-12 md:mb-16 text-center md:text-left">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2"
              >
                {t.myLessons}
              </motion.h1>
              <p className="text-slate-400 font-medium text-sm md:text-base">Your personal library of cosmic knowledge.</p>
            </div>

            <div className="relative group flex-1 md:max-w-md w-full">
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search your library..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="relative w-full bg-bg-space/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3 md:py-4 outline-none focus:border-primary/50 transition-all font-bold text-white placeholder:text-slate-600 text-sm md:text-base"
              />
            </div>

            <Link href="/lesson/new" className="btn-magic inline-flex items-center gap-3 shrink-0 py-3 md:py-4 px-6 md:px-10 mx-auto md:mx-0">
               <Sparkles className="w-5 h-5 text-black" />
               <span className="tracking-tight">{t.newLesson}</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-primary font-black animate-pulse uppercase tracking-[0.2em] text-xs">Summoning Lessons...</p>
            </div>
          ) : filteredLessons && filteredLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/lesson/${lesson.id}`} className="block h-full group">
                    <div className="glass-card h-full p-8 flex flex-col relative overflow-hidden bg-white/[0.02]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl group-hover:bg-primary/20 transition-all" />
                      
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-neon-blue group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                          <BookOpen className="text-black w-8 h-8" />
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                          {lesson.level}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black mb-6 text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight italic">
                        {lesson.topic}
                      </h3>

                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </div>
                        <ArrowRight className="w-6 h-6 text-primary -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 glass-card border-dashed border-white/5"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-12 h-12 text-slate-700" />
              </div>
              <h3 className="text-3xl font-black mb-3 text-white">No cosmic data found</h3>
              <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium">
                {search ? `The archives show no records for "${search}".` : "Your journey through the learning cosmos hasn't begun yet."}
              </p>
              <Link href="/lesson/new" className="btn-magic inline-flex items-center gap-3 scale-110">
                <Sparkles className="w-5 h-5 text-black" />
                <span className="tracking-tight">{t.newLesson}</span>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
