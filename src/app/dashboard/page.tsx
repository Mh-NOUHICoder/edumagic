"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AIChatCompanion from "@/components/AIChatCompanion";
import ProgressRing from "@/components/ProgressRing";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { BookOpen, Trophy, Flame, Plus, Target, Zap, Loader2, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface UserProgress {
  id: string;
  xp: number;
  level: number;
  streak: number;
  progress: Array<{
    id: string;
    lessonId: string;
    completedAt: string;
    xpEarned: number;
    lesson: {
      topic: string;
    };
  }>;
}

export default function Dashboard() {
  const { user } = useUser();
  const { language } = useStore();
  const t = translations[language];

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const res = await fetch("/api/progress");
      if (!res.ok) return null;
      return res.json() as Promise<UserProgress>;
    }
  });

  const stats = {
    level: userData?.level ?? 1,
    xp: userData?.xp ?? 0,
    streak: userData?.streak ?? 0,
    lessonsCount: userData?.progress?.length ?? 0,
    progressPercent: Math.round((( (userData?.xp ?? 0) % 500) / 500) * 100) || 0
  };

  const activities = userData?.progress?.map((p) => ({
    id: p.lessonId,
    title: p.lesson.topic,
    time: new Date(p.completedAt).toLocaleDateString(),
    xp: p.xpEarned,
    icon: BookOpen
  })) || [];

  return (
    <div className="min-h-screen bg-bg-space transition-colors duration-500 overflow-x-hidden overflow-y-auto relative">
      {/* Background Ornaments */}
      <div className="orb orb-cyan -top-40 -left-40" />
      <div className="orb orb-purple top-1/2 -right-60" />
      <div className="orb orb-pink -bottom-40 left-1/3" />

      <Navbar />
      <Sidebar />
      
      <main className="lg:ms-64 pt-20 md:pt-24 px-4 md:px-8 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-5xl font-black mb-3 text-text-main tracking-tighter">
                {t.welcome}, <span className="gradient-text">{user?.firstName || user?.username || "Student"}</span>! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">{t.quantumLeap}</p>
            </div>
            <Link href="/lesson/new" className="btn-magic flex items-center gap-3 w-fit scale-110 hover:scale-115 transition-transform">
              <Plus className="w-6 h-6" />
              <span className="tracking-tight">{t.newLesson}</span>
            </Link>
          </motion.header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
               <Loader2 className="w-12 h-12 animate-spin text-primary" />
               <p className="text-primary font-black animate-pulse uppercase tracking-widest text-xs">{t.syncingData}</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatsCard
                  icon={<Target className="w-6 h-6" />}
                  label={t.currentLevel}
                  value={`Lvl ${stats.level}`}
                  subValue={`${stats.progressPercent}% progress`}
                  color="blue"
                  delay={0.1}
                />
                <StatsCard
                  icon={<Flame className="w-6 h-6 animate-pulse" />}
                  label={t.dayStreak}
                  value={`${stats.streak} Days`}
                  subValue="Streak active!"
                  color="orange"
                  delay={0.2}
                />
                <StatsCard
                  icon={<Trophy className="w-6 h-6" />}
                  label={t.totalXP}
                  value={stats.xp.toLocaleString()}
                  subValue="Magic Points"
                  color="purple"
                  delay={0.3}
                />
                <StatsCard
                  icon={<Zap className="w-6 h-6" />}
                  label="Lessons"
                  value={stats.lessonsCount.toString()}
                  subValue="Mastered items"
                  color="green"
                  delay={0.4}
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-text-main italic">{t.recentActivities}</h3>
                    <Link href="/lessons" className="group flex items-center gap-2 text-sm font-black text-primary hover:text-white transition-colors">
                      {t.myLessons} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {activities.length > 0 ? activities.map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                         <Link href={`/lesson/${activity.id}`} className="card-modern group block hover:no-underline">
                           <div className="flex items-center gap-4 w-full">
                             <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors shrink-0">
                                <BookOpen className="text-primary w-7 h-7 group-hover:scale-110 transition-transform" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-black text-xl text-text-main group-hover:text-primary transition-colors truncate">
                                  {activity.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {activity.time}
                                </p>
                             </div>
                             <div className="text-right shrink-0 pl-4">
                                <span className="text-primary font-black text-xl italic drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
                                   +{activity.xp} XP
                                </span>
                             </div>
                           </div>
                         </Link>
                      </motion.div>
                    )) : (
                      <div className="glass-card p-16 text-center border-dashed border-white/5">
                        <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">{t.journeyNotStarted}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Content */}
                <div className="space-y-8">
                  {/* Progress Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-8 border-primary/20 bg-linear-to-b from-white/[0.08] to-transparent"
                  >
                    <h3 className="text-2xl font-black text-text-main mb-8 text-center">{t.powerLevel}</h3>
                    <div className="flex justify-center mb-8 relative">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
                      <ProgressRing progress={stats.progressPercent} size={160} stroke={12} label={`Level ${stats.level}`} />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span className="text-slate-600 dark:text-slate-500">{t.syncingXP}</span>
                        <span className="text-primary">{(stats.xp % 500).toLocaleString()} / 500</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.progressPercent}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-linear-to-r from-primary via-secondary to-accent rounded-full shadow-[0_0_15px_rgba(0,242,255,0.5)]" 
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-500 text-center font-black uppercase tracking-[0.2em]">{(500 - (stats.xp % 500)).toLocaleString()} {t.xpToEvolution}</p>
                    </div>
                  </motion.div>

                  {/* Achievements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card p-8"
                  >
                    <h3 className="text-2xl font-black text-text-main mb-8">{t.achievements}</h3>
                    <div className="grid grid-cols-3 gap-6">
                      {['🌱', '📚', '🧙‍♂️', '⚡', '🌟', '🚀'].map((emoji, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.2, rotate: 12 }}
                          className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-3xl cursor-pointer border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all shadow-premium"
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </div>
                    <Link
                      href="/badges"
                      className="w-full mt-8 block text-center py-4 text-xs font-black uppercase tracking-widest text-primary border border-primary/20 rounded-2xl hover:bg-primary/10 transition-all"
                    >
                      {t.viewAllBadges}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <AIChatCompanion />
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  subValue,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  color: string;
  delay: number;
}) {
  const colorClasses = {
    blue: "from-primary to-secondary text-black shadow-neon-blue",
    orange: "from-orange-400 to-red-500 text-white shadow-[0_0_20px_rgba(251,146,60,0.3)]",
    purple: "from-secondary to-accent text-white shadow-neon-purple",
    green: "from-emerald-400 to-cyan-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 stat-card-glow group cursor-pointer border-white/5"
    >
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-16 h-16 bg-linear-to-br rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
          colorClasses[color as keyof typeof colorClasses]
        )}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-black tracking-[0.2em] mb-1">{label}</p>
          <h2 className="text-3xl font-black mb-0.5 text-text-main italic group-hover:text-primary transition-colors">{value}</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold italic">{subValue}</p>
        </div>
      </div>
    </motion.div>
  );
}

