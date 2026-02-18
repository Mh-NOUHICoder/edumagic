"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, Trophy, Loader2, Volume2, Square, Play, Brain, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  explanation: string;
  visual_description: string;
  quiz: {
    question: string;
    options: string[];
    answer: string;
    hint: string;
  };
  imageUrl?: string;
}

interface NewLessonContent {
  introduction: string;
  steps: Step[];
  summary: string;
  final_motivation: string;
}

// Legacy support
interface LegacyLessonContent {
  explanation: string;
  quizzes: {
    question: string;
    options: string[];
    answer: string;
    hint: string;
  }[];
}

type LessonContent = NewLessonContent | LegacyLessonContent;

interface Lesson {
  id: string;
  topic: string;
  level: string;
  content: LessonContent & { introductionImageUrl?: string }; 
  userId: string;
  createdAt: string;
}

const IMAGE_SUFFIX = " , cinematic 3d digital art, cyber neon lighting, educational style";

// Sub-component for hyper-resilient AI image materialization
// Moved outside main component to prevent re-mounting on state changes
// Sub-component for hyper-resilient AI image materialization
const ImageMaterializer = ({ 
    prompt, 
    className, 
    seed = 42,
    lessonId,
    stepIndex,
    initialImageUrl 
}: { 
    prompt: string; 
    className?: string; 
    seed?: number;
    lessonId?: string;
    stepIndex?: number;
    initialImageUrl?: string | null;
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(initialImageUrl ? 'success' : 'loading');
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Calibrated prompt with fallback
  const basePrompt = prompt || "abstract digital art concept";
  const fullPrompt = basePrompt + IMAGE_SUFFIX;
  
  // Cache key (updated to v3 to ensure we use Midjourney results)
  const cacheKey = `edumagic_v3_${fullPrompt}`;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const isFallback = (url: string | null) => url?.includes('images.unsplash.com') || url?.includes('pollinations.ai');

    // Check initial image first (database)
    if (initialImageUrl && !isFallback(initialImageUrl)) {
        setImageUrl(initialImageUrl);
        setStatus('success');
        return;
    }

    // Check cache second
    const cachedUrl = localStorage.getItem(cacheKey);
    if (cachedUrl && !isFallback(cachedUrl)) {
        setImageUrl(cachedUrl);
        setStatus('success');
        return;
    }

    // If we have a fallback but no real AI image, show the fallback but proceed to fetch
    if (initialImageUrl || cachedUrl) {
        setImageUrl(initialImageUrl || cachedUrl);
    }

    const fetchImage = async () => {
      setStatus('loading');
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPrompt }),
          signal: controller.signal
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'API Generate Failed');
        }
        
        const data = await res.json();
        if (isMounted && data.imageUrl) {
            setImageUrl(data.imageUrl);
            localStorage.setItem(cacheKey, data.imageUrl); 
            
            // PERSIST TO DATABASE
            if (lessonId) {
                fetch(`/api/lessons/${lessonId}/update-image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl: data.imageUrl,
                        stepIndex: stepIndex
                    })
                }).catch(e => console.error("Persistence failed:", e));
            }

            setStatus('success');
        }
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;
        
        console.error("Image API Error:", err);
        if (isMounted) {
            setStatus('error');
        }
      }
    };

    fetchImage();
    return () => { 
      isMounted = false; 
      controller.abort(); // Cancel request on unmount/re-run
    };
  }, [basePrompt, fullPrompt, retryCount, seed, cacheKey, initialImageUrl, lessonId, stepIndex]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('loading');
    setRetryCount(pk => pk + 1);
    localStorage.removeItem(cacheKey); // Clear cache on retry
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden flex items-center justify-center bg-slate-950/80", className)}>
      <AnimatePresence mode="popLayout">
        {status === 'loading' && (
          <motion.div 
            key="loading-ui"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-bg-space/40 backdrop-blur-sm z-40 pointer-events-none"
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-primary/20 blur-2xl animate-pulse rounded-full" />
              <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
            </div>
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div 
            key="error-ui"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/40 backdrop-blur-3xl z-40 p-10 text-center"
          >
            <XCircle className="w-10 h-10 mb-4 text-red-500/60 shadow-neon-red" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-6">Connection Interrupted</h4>
            <button 
              onClick={handleRetry}
              className="group relative px-6 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all text-red-400 overflow-hidden pointer-events-auto"
            >
              <div className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> 
                Retry Generation
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img 
            src={imageUrl}
            key={`${imageUrl}-${retryCount}`}
            className={cn(
            "w-full h-full object-cover transition-all duration-[2000ms] ease-out",
            status === 'success' ? "blur-0 scale-100" : "blur-lg scale-110"
            )}
            alt="Neural Insight"
            onLoad={() => {
            console.log(`[EduMagic] Visual successfully materialized: ${basePrompt}`);
            setStatus('success');
            }}
            onError={() => {
            console.error(`[EduMagic] Visual failed to manifest: ${basePrompt}`);
            setStatus('error');
            // Remove bad URL from cache so we can retry properly
            localStorage.removeItem(cacheKey); 
            }}
            loading="eager"
        />
      )}
      {/* Aesthetic Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-bg-space/95 via-transparent to-transparent opacity-90 z-10 pointer-events-none" />
    </div>
  );
};


export default function LessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1); // -1 is Intro, >= 0 are steps, 999 is result
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { width, height } = useWindowSize();
  const { language } = useStore();
  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const nextLevel = useMemo(() => {
    if (!lesson) return null;
    const current = lesson.level.toLowerCase();
    if (current.includes('beginner')) return 'intermediate';
    if (current.includes('intermediate')) return 'advanced';
    return null;
  }, [lesson]);

  const handleLevelUp = async () => {
    if (!nextLevel || !lesson || isLevelingUp) return;
    setIsLevelingUp(true);
    const loadingToastId = toast.loading(`${t.magicInProgress} (${nextLevel})...`);
    
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: lesson.topic,
          level: nextLevel,
          language: language
        }),
      });
      
      if (!res.ok) throw new Error("Failed to summon next level");
      
      const newLesson = await res.json();
      toast.success(t.correctMessage, { id: loadingToastId });
      router.push(`/lesson/${newLesson.id}`);
    } catch (err) {
      toast.error(t.wrongMessage, { id: loadingToastId });
      console.error("Level Up Error:", err);
    } finally {
      setIsLevelingUp(false);
    }
  };

  // Shuffle quiz options to prevent the correct answer from always being first
  // Must be called before any early returns (Rules of Hooks)
  const shuffledOptions = useMemo(() => {
    if (!lesson) return [];
    const lessonData = lesson.content;
    const isNewFormat = !!(lessonData as any)?.steps;
    const normalizedSteps: Step[] = isNewFormat 
      ? (lessonData as NewLessonContent).steps 
      : (lessonData as LegacyLessonContent).quizzes?.map((q, i) => ({
          title: `Part ${i + 1}`,
          explanation: i === 0 ? (lessonData as LegacyLessonContent).explanation : "Continue your practice...",
          visual_description: lesson.topic,
          quiz: q
        })) || [];
    
    const currentStep = normalizedSteps[currentStepIdx];
    if (!currentStep?.quiz?.options) return [];
    
    const options = [...currentStep.quiz.options];
    // Fisher-Yates shuffle algorithm
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, [lesson, currentStepIdx]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lessons/${id}`);
        if (!res.ok) throw new Error("Cosmic archive not found.");
        const data = await res.json();
        setLesson(data);
        
        // Restore progress
        const savedStep = localStorage.getItem(`lesson_progress_${id}`);
        if (savedStep) {
          setCurrentStepIdx(parseInt(savedStep));
        }

        const savedCompleted = localStorage.getItem(`lesson_completed_steps_${id}`);
        if (savedCompleted) {
          setCompletedSteps(new Set(JSON.parse(savedCompleted)));
        }

      } catch {
        toast.error("Failed to summon the lesson.");
      }
    };
    if (id) fetchLesson();
    return () => window.speechSynthesis.cancel();
  }, [id]);

  // Save progress
  useEffect(() => {
    if (id && currentStepIdx >= 0) {
      localStorage.setItem(`lesson_progress_${id}`, currentStepIdx.toString());
    }
    if (id && completedSteps.size > 0) {
      localStorage.setItem(`lesson_completed_steps_${id}`, JSON.stringify(Array.from(completedSteps)));
    }
  }, [id, currentStepIdx, completedSteps]);

  // Neural Prefetching: Preload all AI images in the background
  useEffect(() => {
    if (lesson?.content) {
      const lessonContent = lesson.content as NewLessonContent;
      const steps = lessonContent.steps || [];
      
      // 1. Prepare all prompts including intro
      const prompts = [
        { prompt: (lessonContent as any).introduction_visual || lesson.topic, type: 'intro' },
        ...steps.map((s, i) => ({ prompt: s.visual_description, type: 'step', index: i }))
      ];

      prompts.forEach(async (item, i) => {
        const fullPrompt = item.prompt + IMAGE_SUFFIX;
        const cacheKey = `edumagic_v3_${fullPrompt}`;
        
        // Skip if already in database or localStorage
        if (localStorage.getItem(cacheKey)) return;

        // Small staggered delay to prevent hitting API limits too hard
        await new Promise(r => setTimeout(r, i * 1500));

        try {
          // Trigger a background fetch
          const res = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: fullPrompt }),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data?.imageUrl) {
              localStorage.setItem(cacheKey, data.imageUrl);
              console.log(`[Prefetch] Materialized visual for ${item.type}: ${item.prompt}`);
            }
          }
        } catch (err) {
          console.warn(`[Prefetch] Failed for ${item.prompt}`, err);
        }
      });
    }
  }, [lesson]);

  if (!lesson) return (
    <div className="min-h-screen bg-bg-space flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary shadow-neon-blue" />
    </div>
  );

  const lessonData = lesson.content;
  const isNewFormat = !!(lessonData as any).steps;
  // Typed helper for new format content — avoids union type errors
  const newContent = isNewFormat ? (lessonData as NewLessonContent) : null;

  // Normalization for legacy lessons
  const normalizedSteps: Step[] = isNewFormat 
    ? (lessonData as NewLessonContent).steps 
    : (lessonData as LegacyLessonContent).quizzes?.map((q, i) => ({
        title: `Part ${i + 1}`,
        explanation: i === 0 ? (lessonData as LegacyLessonContent).explanation : "Continue your practice...",
        visual_description: lesson.topic,
        quiz: q
      })) || [];

  const totalSteps = normalizedSteps.length;
  const currentStep = normalizedSteps[currentStepIdx];

  const handleAnswer = (option: string) => {
    setSelected(option);
    const correct = option === currentStep.quiz.answer;
    setIsCorrect(correct);
    if (correct) {
      if (!completedSteps.has(currentStepIdx)) {
        setScore(s => s + 1);
        setCompletedSteps(prev => new Set(prev).add(currentStepIdx));
      }
      toast.success(t.correctMessage, { icon: '✨' });
    } else {
      toast.error(t.wrongMessage, { icon: '💡' });
      // Senior creative effect: Subtle vibration/shake on the container
      if (typeof window !== 'undefined') {
        const quizCard = document.getElementById('quiz-card');
        if (quizCard) {
          quizCard.classList.add('animate-shake');
          setTimeout(() => quizCard.classList.remove('animate-shake'), 500);
        }
      }
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setIsCorrect(null);
  };

  const previousStep = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSelected(null);
    setIsCorrect(null);
    if (currentStepIdx > 0) {
      setCurrentStepIdx(s => s - 1);
    }
  };

  const nextStep = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSelected(null);
    setIsCorrect(null);
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(s => s + 1);
    } else {
      setCurrentStepIdx(999); // Show summary/result
      saveFinalProgress();
    }
  };

  const saveFinalProgress = async () => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: id,
          score: score,
        }),
      });
    } catch (err) {
      console.error("Save Progress Error:", err);
    }
  };

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speak = () => {
      // Clean text: Remove markdown-like symbols for better speech
      const cleanText = text.replace(/[*_#`~]/g, "").trim();
      const newUtterance = new SpeechSynthesisUtterance(cleanText);
      
      const langMap: Record<string, string> = {
        'ar': 'ar-SA',
        'fr': 'fr-FR',
        'en': 'en-US'
      };

      const targetLang = langMap[language] || 'en-US';
      newUtterance.lang = targetLang;
      
      const voices = window.speechSynthesis.getVoices();
      
      // Sophisticated voice selection
      const voice = voices.find(v => v.lang === targetLang) || 
                  voices.find(v => v.lang.startsWith(targetLang.split('-')[0])) ||
                  voices.find(v => v.lang.includes(targetLang.split('-')[0]));
      
      if (voice) {
        newUtterance.voice = voice;
      }

      // Voice tuning for Arabic
      if (language === 'ar') {
        newUtterance.rate = 0.9; // Arabic sounds better slightly slower
        newUtterance.pitch = 1.0;
      } else {
        newUtterance.rate = 1.0;
        newUtterance.pitch = 1.1;
      }

      newUtterance.onstart = () => setIsSpeaking(true);
      newUtterance.onend = () => setIsSpeaking(false);
      newUtterance.onerror = (e) => {
        console.error("Speech Synthesis Error:", e);
        setIsSpeaking(false);
        toast.error("Speech system encountered a hiccup.");
      };

      window.speechSynthesis.speak(newUtterance);
    };

    // Browsers often load voices asynchronously
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
        // Remove listener after first trigger to avoid double-triggering
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      speak();
    }
  };

  return (
    <div className="min-h-screen bg-bg-space transition-colors duration-500 pt-24 pb-20 px-6 relative overflow-hidden">
      <Navbar />
      
      {/* Dynamic Background Orbs */}
      <div className="orb orb-cyan top-1/4 -right-20 animate-pulse-slow" />
      <div className="orb orb-purple bottom-1/4 -left-20 animate-pulse-slow" />

      {currentStepIdx === 999 && score >= totalSteps / 2 && (
        <Confetti width={width} height={height} recycle={false} colors={['#00F2FF', '#7000FF', '#FF00E5']} />
      )}

      <div className="max-w-4xl mx-auto py-10">
        {/* Step Progress Bar */}
        <div className="flex gap-2 mb-12">
          {([-1, ...Array.from({ length: totalSteps }, (_, i) => i), 999] as number[]).map((s: number) => (
            <div 
              key={s} 
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-500 shadow-sm",
                currentStepIdx === s ? "bg-primary shadow-neon-blue" : ((currentStepIdx > s || completedSteps.has(s)) ? "bg-secondary" : "bg-white/5")
              )}
            />
          ))}
        </div>
<AnimatePresence mode="wait">
          {currentStepIdx === -1 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="glass-card p-8 md:p-20 text-center space-y-6 md:space-y-8"
            >
              <div className="inline-block p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-4">
                 <Play className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <div className="relative group mb-8">
                <div className="absolute -inset-6 bg-linear-to-r from-primary via-secondary to-accent rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-1000" />
                <div className="relative w-full max-w-sm aspect-square mx-auto rounded-[2.5rem] overflow-hidden border border-white/10 shadow-premium group-hover:border-primary/30 transition-all">
                  <ImageMaterializer 
                    prompt={(lesson.content as any).introduction_visual || lesson.topic} 
                    lessonId={lesson.id}
                    stepIndex={-1}
                    initialImageUrl={lesson.content.introductionImageUrl}
                  />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black gradient-text tracking-tighter">
                {lesson.topic}
              </h1>
              <p className="text-2xl text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed">
                {isNewFormat ? newContent?.introduction : t.readyToMaster}
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center mt-8">
                <button onClick={() => setCurrentStepIdx(0)} className="btn-magic h-20 px-12 text-2xl tracking-tighter">
                   {t.beginJourney}
                </button>
                {nextLevel && (
                  <button 
                    onClick={handleLevelUp} 
                    disabled={isLevelingUp}
                    className="glass h-20 px-12 rounded-3xl font-bold flex items-center border-white/10 hover:border-white/30 transition-all text-xl gap-3"
                  >
                    {isLevelingUp ? <Loader2 className="animate-spin" /> : <Sparkles className="text-magic-gold" />}
                    {t.masterNextLevel} ({nextLevel})
                  </button>
                )}
              </div>
            </motion.div>
          ) : currentStepIdx < totalSteps ? (
            <motion.div
              key={currentStepIdx}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Section - AI Materializer */}
                <div className="glass-card p-4 h-full min-h-[450px] flex flex-col justify-center items-center text-center group bg-white/[0.01] relative">
                  <div className="w-full h-full rounded-[2rem] bg-bg-space/40 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-primary/30 transition-all duration-1000">
                    
                    {/* Generative AI Image */}
                    <div className="absolute inset-0">
                      <ImageMaterializer 
                        prompt={currentStep.visual_description} 
                        lessonId={lesson.id}
                        stepIndex={currentStepIdx}
                        initialImageUrl={currentStep.imageUrl}
                      />
                    </div>

                    {/* Materializing Animation Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-20">
                       <div className="w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-20 animate-scan" />
                    </div>
                    
                    {/* Visual Meta Info */}
                    <div className="relative z-20 mt-auto p-8 text-left w-full">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-primary/30 mb-4">
                          <Brain className="w-3 h-3 text-primary animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t.neuralVisualization}</span>
                       </div>
                       <p className="text-xl font-black text-white leading-tight drop-shadow-lg">
                         {currentStep.title}
                       </p>
                       <p className="text-xs text-slate-300 mt-2 font-medium bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm italic line-clamp-2 uppercase tracking-tighter">
                         &quot;{currentStep.visual_description}&quot;
                       </p>
                    </div>
                  </div>
                </div>

                {/* Explanation Section */}
                <div className="glass-card p-6 md:p-10 flex flex-col justify-between">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-start">
                      <span className="px-4 py-1.5 bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-widest">
                        {t.step} {currentStepIdx + 1} {t.of} {totalSteps}
                      </span>
                      <button 
                        onClick={() => toggleSpeech(currentStep.explanation)}
                        className={cn(
                          "p-4 rounded-2xl transition-all border",
                          isSpeaking ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10"
                        )}
                      >
                         {isSpeaking ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">{currentStep.title}</h2>
                    <div className="whitespace-pre-wrap text-xl md:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                      {currentStep.explanation}
                    </div>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="flex gap-3 mt-6">
                    {currentStepIdx > 0 && (
                      <button 
                        onClick={previousStep}
                        className="px-6 py-3 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t.previousConcept}
                      </button>
                    )}
                    {completedSteps.has(currentStepIdx) && (
                      <button 
                        onClick={nextStep}
                        className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold text-sm hover:bg-primary/20 transition-all flex items-center gap-2 ml-auto"
                      >
                        {t.nextConcept}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Concept Check Trigger */}
                  {!selected && !completedSteps.has(currentStepIdx) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8">
                       <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                          <div className="w-2 h-10 bg-primary rounded-full shadow-neon-blue" />
                          <p className="text-sm font-bold text-primary">{t.masterToContinue}</p>
                       </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Quiz Card */}
              <motion.div 
                id="quiz-card"
                className={cn(
                  "glass-card p-6 md:p-12 transition-all duration-300",
                  isCorrect === false && "border-red-500/50 shadow-neon-red bg-red-500/[0.02]"
                )}
                animate={selected ? { scale: 1 } : { scale: 0.98 }}
              >
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
                      <CheckCircle2 className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.conceptCheck}: {currentStep.quiz.question}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shuffledOptions.map((opt) => (
                    <button
                      key={opt}
                      disabled={!!selected && isCorrect === true}
                      onClick={() => handleAnswer(opt)}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left font-bold transition-all duration-300",
                        selected === opt 
                          ? (isCorrect ? "border-green-500 bg-green-500/10 text-green-500" : "border-red-500 bg-red-500/10 text-red-500")
                          : "border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:bg-slate-200 dark:hover:bg-white/10"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {(selected || completedSteps.has(currentStepIdx)) && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    {!isCorrect && selected && !completedSteps.has(currentStepIdx) && (
                      <>
                        <p className="text-slate-500 dark:text-slate-400 font-bold italic flex-1">💡 {t.hint}: {currentStep.quiz.hint}</p>
                        <button 
                          onClick={handleRetry} 
                          className="px-8 py-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl text-yellow-400 font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-all text-sm flex items-center gap-3 shadow-lg"
                        >
                          <XCircle className="w-5 h-5" />
                          {t.retry}
                        </button>
                      </>
                    )}
                    {(isCorrect || completedSteps.has(currentStepIdx)) && (
                      <button onClick={nextStep} className="btn-magic h-16 px-12 text-lg w-full md:w-auto ml-auto">
                        {currentStepIdx === totalSteps - 1 ? t.completeJourney : t.nextConcept}
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 md:p-20 text-center space-y-12"
            >
              <div className="relative inline-block">
                <div className="absolute -inset-8 bg-secondary blur-3xl opacity-20 animate-pulse" />
                <Trophy className="w-24 h-24 text-magic-gold mx-auto drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-6xl font-black gradient-text tracking-tighter">{t.missionAccomplished}</h2>
                <p className="text-2xl text-slate-600 dark:text-slate-400 font-bold max-w-xl mx-auto">
                  {isNewFormat ? newContent?.final_motivation : t.youFinished}
                </p>
              </div>

              <div className="glass-card p-8 bg-slate-100 dark:bg-white/[0.03] max-w-2xl mx-auto border-slate-200 dark:border-white/5">
                <p className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">{t.journeySummary}</p>
                <div className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  &quot;{isNewFormat ? newContent?.summary : t.keepPracticing}&quot;
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
                <Link href="/dashboard" className="btn-magic h-20 px-12 text-xl tracking-tighter flex items-center gap-3">
                  {t.backToHQ}
                </Link>
                {nextLevel ? (
                   <button 
                    onClick={handleLevelUp} 
                    disabled={isLevelingUp}
                    className="glass h-20 px-12 rounded-3xl font-bold flex items-center border-white/10 hover:border-white/30 transition-all text-xl gap-3"
                   >
                     {isLevelingUp ? <Loader2 className="animate-spin" /> : <Trophy className="text-magic-gold" />}
                     {t.masterNextLevel} ({nextLevel})
                   </button>
                ) : (
                  <Link href="/lesson/new" className="glass h-20 px-12 rounded-3xl font-bold flex items-center border-white/10 hover:border-white/30 transition-all text-xl">
                    {t.tryAnotherTopic}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


