"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { TrendingUp, Award, Clock, Lightbulb } from "lucide-react";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";

const xpData = [
  { day: "Mon", xp: 120 },
  { day: "Tue", xp: 300 },
  { day: "Wed", xp: 200 },
  { day: "Thu", xp: 450 },
  { day: "Fri", xp: 600 },
  { day: "Sat", xp: 400 },
  { day: "Sun", xp: 550 },
];

const skillData = [
  { subject: "React", A: 120, B: 110, fullMark: 150 },
  { subject: "Next.js", A: 98, B: 130, fullMark: 150 },
  { subject: "TypeScript", A: 86, B: 130, fullMark: 150 },
  { subject: "CSS", A: 99, B: 100, fullMark: 150 },
  { subject: "AI", A: 85, B: 90, fullMark: 150 },
  { subject: "Testing", A: 65, B: 85, fullMark: 150 },
];

export default function Analytics() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-24 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t.learningAnalytics}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* XP Growth Chart */}
            <div className="glass p-6 rounded-3xl h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-blue-500" />
                <h3 className="font-bold">{t.xpGrowthCurve}</h3>
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={xpData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="day" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="xp" stroke="#3b82f6" fillOpacity={1} fill="url(#colorXp)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Skill Mastery Radar */}
            <div className="glass p-6 rounded-3xl h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <Award className="text-purple-500" />
                <h3 className="font-bold">{t.skillMasteryRadar}</h3>
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                  <PolarGrid strokeOpacity={0.1} />
                  <PolarAngleAxis dataKey="subject" />
                  <Radar name="Student" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-green-500" />
                <h4 className="font-bold">{t.timeSpent}</h4>
              </div>
              <p className="text-3xl font-extrabold">24.5 Hours</p>
              <p className="text-sm text-slate-500">+12% from last week</p>
            </div>

            <div className="glass p-6 rounded-3xl md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-500" />
                <h4 className="font-bold">{t.smartRecommendations}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Try Advanced React patterns", "Improve TypeScript Generics", "Complete Daily Streak"].map((tag) => (
                  <span key={tag} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
