"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Sparkles, Zap, Globe, GraduationCap, Brain, Rocket, Star, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";

export default function LandingPage() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-bg-space transition-colors duration-500 overflow-x-hidden relative">
      <Navbar />
      
      {/* Background Orbs */}
      <div className="orb orb-cyan -top-40 -left-40" />
      <div className="orb orb-purple top-1/4 -right-60" />
      <div className="orb orb-pink bottom-0 left-1/2" />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated Magic Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-12 backdrop-blur-3xl"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-neon-blue" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">New Era of Learning</span>
            </motion.div>

            {/* Heading with Neon Effects */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl sm:text-7xl md:text-9xl font-black mb-10 tracking-[-0.05em] leading-[0.9] md:leading-[0.85] text-text-main px-4"
            >
              {t.masterSkill} <br />
              <span className="gradient-text italic filter drop-shadow-[0_0_30px_rgba(0,242,255,0.4)]">
                {t.aiMagic}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-bold"
            >
              {t.landingDesc}
            </motion.p>

            {/* CTA Buttons - Premium Styled */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/dashboard" className="btn-magic text-xl px-14 py-6 group scale-110">
                <span className="flex items-center gap-4">
                  {t.startLearning}
                  <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </Link>
              <Link href="#features" className="text-white/60 hover:text-white font-black uppercase tracking-widest text-xs py-4 px-8 border-b-2 border-transparent hover:border-primary transition-all">
                {t.exploreFeatures}
              </Link>
            </motion.div>

            {/* Stats - Holographic Styling */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto"
            >
              <StatItem number="10K+" label="Global Students" icon={<Globe className="w-5 h-5" />} />
              <StatItem number="24/7" label="AI Assistance" icon={<Brain className="w-5 h-5" />} />
              <StatItem number="50+" label="Skill Paths" icon={<GraduationCap className="w-5 h-5" />} />
              <StatItem number="99%" label="Magic Results" icon={<Sparkles className="w-5 h-5" />} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Cyber Modern */}
      <section id="features" className="py-40 px-6 relative bg-linear-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-32"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 text-text-main tracking-tight italic">
              Empower Your <span className="text-primary italic">Potential</span>
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[10px]">
              Next-Generation AI Education Engine
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Zap className="text-primary w-8 h-8" />}
              title={t.aiTutor}
              description={t.aiTutorDesc}
              delay={0.1}
            />
            <FeatureCard
              icon={<Globe className="text-secondary w-8 h-8" />}
              title={t.darijaBuddy}
              description={t.darijaCompDesc}
              delay={0.2}
            />
            <FeatureCard
              icon={<GraduationCap className="text-accent w-8 h-8" />}
              title={t.gamification}
              description={t.gamificationDesc}
              delay={0.3}
            />
            <FeatureCard
              icon={<Brain className="text-primary w-8 h-8" />}
              title="Quantum Adaptive"
              description="Our neural networks analyze your learning speed and calibrate lessons in real-time."
              delay={0.4}
            />
            <FeatureCard
              icon={<Star className="text-secondary w-8 h-8" />}
              title="Arcane Insights"
              description="Get deep philosophical breakdowns and modern analogies for complex concepts."
              delay={0.5}
            />
            <FeatureCard
              icon={<TrendingUp className="text-accent w-8 h-8" />}
              title="Growth Matrix"
              description="Visualize your intellectual expansion with predictive progress heatmaps."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="orb orb-cyan opacity-20 -bottom-40 right-0" />
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-10 md:p-20 text-center relative overflow-hidden border-primary/20"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/5" />
            <div className="relative z-10">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-10 animate-pulse" />
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 text-text-main tracking-tighter">
                Rewrite Your <span className="gradient-text italic">Destiny</span>
              </h2>
              <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium">
                The barriers of traditional education are gone. Step into the future of autonomous intelligence.
              </p>
              <Link href="/sign-in" className="btn-magic text-2xl px-16 py-7 inline-block scale-110 hover:scale-115 transition-all">
                Initialize Genesis free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 bg-bg-space">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="p-3 bg-primary/20 rounded-2xl shadow-neon-blue">
               <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <span className="text-4xl font-black text-text-main tracking-tighter italic">EduMagic</span>
          </div>
          <div className="flex justify-center gap-12 mb-12">
             {['Twitter', 'Discord', 'Docs', 'Support'].map(link => (
               <a key={link} href="#" className="text-slate-500 hover:text-primary font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                 {link}
               </a>
             ))}
          </div>
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">
            © 2026 Quantum AI Labs. Secured by Magic Protocol.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="text-center group">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-white/5 rounded-xl text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
           {icon}
        </div>
      </div>
      <div className="text-3xl md:text-4xl font-black text-text-main mb-2 tracking-tighter italic group-hover:text-primary transition-colors">
        {number}
      </div>
      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="glass-card group cursor-pointer p-10 border-white/5 hover:border-primary/30 transition-all duration-500"
    >
      <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-8 group-hover:shadow-neon-blue group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary/10 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-3xl font-black mb-6 text-text-main group-hover:text-primary transition-colors italic leading-tight">
        {title}
      </h3>
      <p className="text-slate-400 font-medium leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

