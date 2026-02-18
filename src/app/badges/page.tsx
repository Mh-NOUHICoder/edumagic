"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Lock, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { BADGES } from "@/utils/gamification";

export default function BadgesPage() {
  const { xp, language } = useStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-24 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black mb-2 gradient-text-premium">{t.badges}</h1>
              <p className="text-gray-400">Unlock magical achievements as you learn</p>
            </div>
            <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 border-yellow-500/30">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Your Total XP</p>
                <p className="text-2xl font-black text-yellow-500">{xp.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BADGES.map((badge, index) => {
              const isUnlocked = xp >= badge.xpRequired;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-8 group relative overflow-hidden ${
                    !isUnlocked ? "opacity-60 saturate-0" : "border-magic-purple/30"
                  }`}
                >
                  {/* Background Decoration */}
                  <div className={`absolute -right-8 -bottom-8 w-32 h-32 blur-3xl rounded-full opacity-20 transition-all duration-500 group-hover:scale-150 ${
                    isUnlocked ? "bg-magic-purple" : "bg-gray-500"
                  }`} />
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-24 h-24 rounded-3xl mb-6 flex items-center justify-center text-5xl shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                      isUnlocked 
                        ? "bg-linear-to-br from-magic-blue to-magic-purple glow-purple" 
                        : "bg-white/5 border border-white/10"
                    }`}>
                      {isUnlocked ? badge.icon : <Lock className="w-10 h-10 text-gray-500" />}
                    </div>
                    
                    <h3 className={`text-2xl font-black mb-2 ${isUnlocked ? "text-white" : "text-gray-500"}`}>
                      {badge.name}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-6 font-medium">
                      {isUnlocked ? "Achievement Unlocked!" : `Requires ${badge.xpRequired} XP`}
                    </p>

                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((xp / badge.xpRequired) * 100, 100)}%` }}
                        className={`h-full ${isUnlocked ? "bg-linear-to-r from-green-400 to-blue-500" : "bg-gray-700"}`} 
                      />
                    </div>
                  </div>

                  {!isUnlocked && (
                    <div className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg border border-white/10">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Locked Future Badges Placeholder */}
            {[
              { name: "Centurion", icon: "💯", xp: 5000 },
              { name: "Legend", icon: "👑", xp: 10000 },
            ].map((future, i) => (
              <div key={i} className="glass-card p-8 border-dashed border-white/10 opacity-40">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 mb-6 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-gray-600">{future.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">Coming Soon at {future.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
