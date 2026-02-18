"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";

export default function AIChatCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const { language } = useStore();
  const t = translations[language];

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage("");
    setChat(prev => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await fetch("/api/ai/darija", {
        method: "POST",
        body: JSON.stringify({ text: userMsg }),
      });
      const data = await res.json();
      
      const aiResponse = data.explanation || (language === "ar" 
        ? "Safi, ana hna bach nchra7 lik hadchi b darija!" 
        : "Okay, I am here to explain this to you in Darija!");
        
      setChat(prev => [...prev, { role: "ai", content: aiResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChat(prev => [...prev, { role: "ai", content: "Oups! Sma7 lia, t3ksat lia l'magie chno bghiti t3rf?" }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="glass w-80 h-96 mb-4 rounded-3xl overflow-hidden flex flex-col glow border-blue-500/30"
          >
            <div className="bg-linear-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 animate-bounce" />
                <span className="font-bold">{t.darijaBuddy}</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20 scrollbar-hide">
              {chat.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 px-6">
                  <div className="p-4 bg-blue-500/10 rounded-full">
                    <Bot className="w-12 h-12 text-blue-500" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-400">Mar7ba! I&apos;m your Darija Buddy. Ask me anything about your lesson, and I&apos;ll explain it simply!</p>
                </div>
              )}
              {chat.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm relative ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20" 
                      : "bg-white/10 text-white border border-white/5 rounded-tl-none backdrop-blur-md"
                  }`}>
                    {msg.role === "ai" && (
                      <div className="absolute -top-6 left-0 text-[8px] font-black uppercase text-blue-400/60 tracking-[0.2em]">Buddy</div>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl flex gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Talk to your buddy..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              />
              <button 
                onClick={handleSend} 
                className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/40 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-linear-to-br from-blue-500 via-purple-600 to-accent rounded-2xl flex items-center justify-center text-white shadow-[0_20px_40px_-5px_rgba(0,242,255,0.4)] relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <MessageCircle className="w-8 h-8 relative z-10" />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-primary blur-2xl opacity-20 -z-10 animate-pulse" />
      </motion.button>
    </div>
  );
}
