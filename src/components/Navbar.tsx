"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Sparkles, Moon, Sun, Languages, AlignRight, X, LayoutDashboard, Rocket, BookOpen, ShieldCheck, User, ArrowRight, Activity } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const { setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage } = useStore();
  const t = translations[language];
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { href: "/lessons", label: t.myLessons, icon: BookOpen },
    { href: "/lesson/new", label: t.newLesson, icon: Sparkles },
    { href: "/badges", label: t.badges, icon: ShieldCheck },
    { href: "/test-keys", label: "API Diagnostics", icon: Activity },
    { href: "/profile", label: t.profile, icon: User },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-bg-space/80 backdrop-blur-3xl h-16 flex items-center justify-between px-6 border-b border-white/5 shadow-premium">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 md:gap-4 group relative shrink-0">
          <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <motion.div
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="relative p-1.5 md:p-2.5 bg-linear-to-br from-primary to-secondary rounded-lg md:rounded-xl shadow-neon-blue">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-black" />
            </div>
          </motion.div>
          <span className="text-xl md:text-2xl font-black text-text-main tracking-tighter italic">EduMagic</span>
        </Link>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Switcher Dropdown */}
          <div className="relative group/lang">
            <button className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group-hover/lang:bg-white/10">
                <Languages className="w-4 h-4 text-primary" />
                <span className="text-xs font-black text-text-main uppercase tracking-widest">{language}</span>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 py-3 bg-bg-space/95 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-300 transform origin-top translate-y-2 group-hover/lang:translate-y-0 shadow-2xl z-50">
                {[
                  { code: 'en' as const, label: 'English', icon: '🇬🇧' },
                  { code: 'ar' as const, label: 'العربية', icon: '🇲🇦' },
                  { code: 'fr' as const, label: 'Français', icon: '🇫🇷' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-6 py-3 text-sm font-black transition-all hover:bg-white/5 ${
                      language === lang.code ? 'text-primary' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{lang.icon}</span>
                      <span className="tracking-tight">{lang.label}</span>
                    </span>
                    {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-neon-blue" />}
                  </button>
                ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent transition-all duration-500"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            ) : (
              <Moon className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
            )}
          </motion.button>

          {/* User Section */}
          {isSignedIn ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-2xl border-2 border-primary/20 hover:border-primary/60 transition-all shadow-neon-blue",
                  },
                }}
              />
            </div>
          ) : (
            <Link href="/sign-in" className="btn-magic text-sm px-8 py-3 scale-95 hover:scale-100 transition-transform">
              {t.getStarted}
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-4">
          {isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-xl border border-primary/20",
                },
              }}
            />
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="relative z-60 p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary transition-all active:scale-95"
          >
            {isOpen ? <X className="w-6 h-6 animate-in fade-in zoom-in duration-300" /> : <AlignRight className="w-6 h-6 animate-in fade-in slide-in-from-right-2 duration-300" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Outside nav to prevent clipping and stacking issues */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] bg-bg-space/80 lg:hidden flex flex-col overflow-hidden"
          >
            {/* Animated Background Orbs for Mobile Menu */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <div className="relative z-10 flex flex-col h-full p-8 pt-24 overflow-y-auto">
              {/* Quick Stats/User Info on Mobile */}
              {!isSignedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="btn-magic w-full py-5 text-center mb-8 flex items-center justify-center gap-3 text-lg"
                  >
                    <Rocket className="w-5 h-5" />
                    {t.getStarted}
                  </Link>
                </motion.div>
              )}

              {/* Navigation Links with Staggered Animation */}
              <div className="space-y-3 mb-10 text-left">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-black mb-6 pl-2">Navigation Terminal</p>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-primary/50 transition-all active:bg-white/10 overflow-hidden relative"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-linear-to-br from-primary/20 to-secondary/20 rounded-xl group-hover:scale-110 transition-transform">
                          <link.icon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-2xl font-black text-text-main italic tracking-tight">{link.label}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Language & Theme on Mobile */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-auto grid grid-cols-2 gap-4 pb-12"
              >
                <button 
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 rounded-3xl border border-white/5 active:bg-white/10 group active:scale-95 transition-all"
                >
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:rotate-12 transition-transform">
                    {resolvedTheme === "dark" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-primary" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{resolvedTheme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>

                <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1 px-2">
                     <Languages className="w-4 h-4 text-secondary" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-arabic">اللغة</span>
                  </div>
                  <div className="flex justify-around items-center">
                    {(['en', 'ar', 'fr'] as const).map(l => (
                      <button 
                        key={l}
                        onClick={() => { setLanguage(l); setIsOpen(false); }}
                        className={`text-xs font-black uppercase w-10 h-10 rounded-xl transition-all ${language === l ? 'bg-primary text-black shadow-neon-blue' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Close button background circle for visual balance */}
            <div className="absolute top-6 right-6 w-12 h-12 bg-white/5 rounded-full -z-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
