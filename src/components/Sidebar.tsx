"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, ShieldCheck, User, Sparkles, Activity, Image as ImageIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const { language } = useStore();
  const t = translations[language];

  const links = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { href: "/lessons", label: t.myLessons, icon: BookOpen },
    { href: "/lesson/new", label: t.newLesson, icon: Sparkles },
    { href: "/analytics", label: t.analytics, icon: BarChart2 },
    { href: "/badges", label: t.badges, icon: ShieldCheck },
    { href: "/test-keys", label: t.apiDiagnostics, icon: Activity },
    { href: "/test-image", label: t.neuralLab, icon: ImageIcon },
    { href: "/profile", label: t.profile, icon: User },
  ];

  return (
    <aside className="w-64 bg-bg-space/90 backdrop-blur-3xl h-[calc(100vh-4rem)] fixed inset-inline-start-0 top-16 hidden lg:flex flex-col p-6 gap-2 border-inline-end border-white/5 z-40">
      {/* Sidebar Header Decorative Orb */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Sidebar Header */}
      <div className="mb-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative p-3 bg-bg-space rounded-xl border border-white/10">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tighter text-text-main">EduMagic</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">AI Academy</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {links.map((link, index) => {
          const isActive = pathname === link.href;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={link.href}
                className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "sidebar-link-active"
                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {/* Icon */}
                <link.icon
                  className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                    isActive ? "text-black scale-110" : "text-slate-500 group-hover:text-primary group-hover:rotate-12"
                  }`}
                />

                {/* Label */}
                <span className={`font-black text-sm relative z-10 tracking-tight ${isActive ? "text-black" : ""}`}>
                  {link.label}
                </span>

                {/* Hover Indicator */}
                {!isActive && (
                  <div className="absolute left-0 w-1 h-0 bg-primary group-hover:h-1/2 transition-all duration-300 rounded-full" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Section - Status Card */}
      <div className="pt-8 border-t border-white/5">
        <div className="glass-card p-5 group relative cursor-pointer overflow-hidden border-primary/20">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-primary/20 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-primary" />
             </div>
             <p className="text-xs font-black text-text-main uppercase tracking-wider">{t.premium}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
            {t.premiumUnlock}
          </p>
        </div>
      </div>
    </aside>
  );
}
