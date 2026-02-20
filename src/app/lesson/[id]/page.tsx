"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, Trophy, Loader2, Volume2, Square, Brain, Sparkles, BookOpen, Youtube, Wrench, FileText, Lightbulb, ArrowRight, Star, Play, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { cn } from "@/lib/utils";

const ensureAbsoluteUrl = (url: string) => {
  if (!url || url === "#") return "https://www.google.com/search?q=";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `https://${url}`;
};

interface Step {
  title: string;
  explanation: string;
  visual_description: string;
  real_world?: string;
  quiz: {
    question: string;
    options: string[];
    answer: string;
    hint: string;
    explanation?: string;
  };
  resources?: Resource[];
  imageUrl?: string;
}

interface Resource {
  type: 'video' | 'article' | 'book' | 'tool';
  title: string;
  description: string;
  url: string;
  difficulty: string;
}

interface NewLessonContent {
  introduction: string;
  introduction_visual?: string;
  key_concepts?: string[];
  steps: Step[];
  summary: string;
  final_motivation: string;
  resources?: Resource[];
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
    
    // Resilient level detection
    if (current.includes('beginner') || current.includes('easy')) return 'intermediate';
    if (current.includes('intermediate') || current.includes('medium')) return 'advanced';
    if (current.includes('advanced') || current.includes('hard') || current.includes('expert')) return null;
    
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
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to summon next level");
      }
      
      toast.success(t.correctMessage, { id: loadingToastId });
      router.push(`/lesson/${data.id}`);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Level Up Error:", error);
      toast.error(`Magical Surge Failed: ${error.message || "Archive unavailable"}`, { 
        id: loadingToastId,
        icon: '🚫'
      });
    } finally {
      setIsLevelingUp(false);
    }
  };

  // Shuffle quiz options to prevent the correct answer from always being first
  // Must be called before any early returns (Rules of Hooks)
  const shuffledOptions = useMemo(() => {
    if (!lesson) return [];
    const lessonData = lesson.content;
    const isNewFormat = 'steps' in lessonData;
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
      // Reset state for new lesson load to prevent progress bleed
      setLesson(null);
      setCurrentStepIdx(-1);
      setSelected(null);
      setIsCorrect(null);
      setScore(0);
      setCompletedSteps(new Set());
      setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.scrollTo(0, 0);

      try {
        const res = await fetch(`/api/lessons/${id}`);
        if (!res.ok) throw new Error("Cosmic archive not found.");
        const data = await res.json();
        setLesson(data);
        
        // Restore progress specifically for THIS lesson ID
        const savedStep = localStorage.getItem(`lesson_progress_${id}`);
        if (savedStep) {
          setCurrentStepIdx(parseInt(savedStep));
        }

        const savedCompleted = localStorage.getItem(`lesson_completed_steps_${id}`);
        if (savedCompleted) {
          const parsed = JSON.parse(savedCompleted);
          setCompletedSteps(new Set(Array.isArray(parsed) ? parsed : []));
        }

        const savedScore = localStorage.getItem(`lesson_score_${id}`);
        if (savedScore) {
          setScore(parseInt(savedScore));
        }

      } catch {
        toast.error("Failed to summon the lesson archive.");
      }
    };
    if (id) fetchLesson();
    return () => window.speechSynthesis.cancel();
  }, [id]);

  // Save progress
  useEffect(() => {
    if (!id || !lesson) return;
    
    localStorage.setItem(`lesson_progress_${id}`, currentStepIdx.toString());
    localStorage.setItem(`lesson_score_${id}`, score.toString());
    
    if (completedSteps.size >= 0) {
      localStorage.setItem(`lesson_completed_steps_${id}`, JSON.stringify(Array.from(completedSteps)));
    }
  }, [id, currentStepIdx, completedSteps, score, lesson]);

  // Neural Prefetching: Preload all AI images in the background
  useEffect(() => {
    if (lesson?.content) {
      const lessonContent = lesson.content as NewLessonContent;
      const steps = lessonContent.steps || [];
      
      // 1. Prepare all prompts including intro
      const prompts = [
        { prompt: (lessonContent as NewLessonContent).introduction_visual || lesson.topic, type: 'intro' },
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
  const isNewFormat = 'steps' in lessonData;
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
              key={`intro-${id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 md:p-20 text-center space-y-6 md:space-y-8 relative overflow-hidden"
            >
              {/* Animated Background for Intro */}
              <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent opacity-50" />
              
              <div className="inline-block p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-4 animate-bounce-slow relative z-10">
                 <Play className="w-12 h-12 text-primary shadow-neon-blue" />
              </div>

              <div className="relative group mb-8 z-10">
                <div className="absolute -inset-6 bg-linear-to-r from-primary via-secondary to-accent rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-1000" />
                <div className="relative w-full max-w-sm aspect-square mx-auto rounded-[2.5rem] overflow-hidden border border-white/10 shadow-premium group-hover:border-primary/30 transition-all">
                  <ImageMaterializer 
                    prompt={('introduction_visual' in lesson.content ? (lesson.content as NewLessonContent).introduction_visual : null) || lesson.topic} 
                    lessonId={lesson.id}
                    stepIndex={-1}
                    initialImageUrl={lesson.content.introductionImageUrl}
                  />
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-secondary/20 text-secondary border border-secondary/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    {lesson.level} {t.journey}
                  </span>
                  <div className="h-px w-8 bg-white/10" />
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {totalSteps} {t.unitsOfWisdom}
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black gradient-text tracking-tighter">
                  {lesson.topic}
                </h1>
                <p className="text-2xl text-slate-700 dark:text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed">
                  {isNewFormat ? newContent?.introduction : t.readyToMaster}
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 justify-center mt-8 relative z-10">
                <button onClick={() => setCurrentStepIdx(0)} className="btn-magic h-20 px-12 text-2xl tracking-tighter group">
                   <span className="group-hover:translate-x-1 transition-transform inline-block mr-2">{t.beginJourney}</span>
                   <Sparkles className="inline-block w-6 h-6 animate-pulse" />
                </button>
                {nextLevel && (
                  <button 
                    onClick={handleLevelUp} 
                    disabled={isLevelingUp}
                    className="glass h-20 px-12 rounded-3xl font-bold flex items-center border-white/10 hover:border-white/30 transition-all text-xl gap-3 hover:bg-white/5"
                  >
                    {isLevelingUp ? <Loader2 className="animate-spin" /> : <Trophy className="text-yellow-500" />}
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
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-text-main">{currentStep.title}</h2>
                    <div className="whitespace-pre-wrap text-xl md:text-2xl text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                      {currentStep.explanation}
                    </div>

                    {/* Real World Application */}
                    {currentStep.real_world && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 mt-2">
                        <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-1">{t.realWorld}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{currentStep.real_world}</p>
                        </div>
                      </div>
                    )}

                    {/* Step-Specific Resources */}
                    {currentStep.resources && currentStep.resources.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 flex items-center gap-2">
                           <BookOpen className="w-3 h-3" /> Deep Dive for this Step
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentStep.resources.map((res, i) => (
                            <a 
                              key={i} 
                              href={ensureAbsoluteUrl(res.url)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="relative z-30 flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-primary/30 transition-all group pointer-events-auto"
                            >
                              <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                {res.type === 'video' ? <Youtube className="w-4 h-4 text-red-400" /> :
                                 res.type === 'book' ? <BookOpen className="w-4 h-4 text-emerald-400" /> :
                                 res.type === 'tool' ? <Wrench className="w-4 h-4 text-primary" /> :
                                 <FileText className="w-4 h-4 text-secondary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{res.title}</p>
                                <p className="text-[9px] font-medium text-slate-600 dark:text-slate-500 uppercase tracking-tighter">{res.type}</p>
                              </div>
                              <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  
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
                   <h3 className="text-2xl font-black text-text-main">{t.conceptCheck}: {currentStep.quiz.question}</h3>
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
                          ? (isCorrect ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-500" : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-500")
                          : "border-black/5 dark:border-white/5 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:border-primary/40 hover:bg-slate-200 dark:hover:bg-white/10"
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
                        <p className="text-slate-600 dark:text-slate-400 font-bold italic flex-1">💡 {t.hint}: {currentStep.quiz.hint}</p>
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
              className="space-y-8"
            >
              {/* === HERO COMPLETION CARD === */}
              <div className="glass-card p-12 md:p-16 text-center space-y-8 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 pointer-events-none" />
                
                {/* Trophy + Level Badge */}
                <div className="relative inline-flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-yellow-400/20 blur-2xl animate-pulse rounded-full" />
                    <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] relative z-10" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest">
                    <Star className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
                    <span className="text-slate-600 dark:text-slate-300">{lesson.level} — {t.completed}</span>
                    <Star className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-5xl md:text-6xl font-black gradient-text tracking-tighter">{t.missionAccomplished}</h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed">
                    {isNewFormat ? newContent?.final_motivation : t.youFinished}
                  </p>
                </div>

                {/* Score */}
                <div className="flex items-center justify-center gap-3">
                  <div className="px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-lg">
                    ⚡ {score} / {totalSteps} {t.correctMessage?.split('!')[0] || 'Correct'}
                  </div>
                </div>

                {/* Key Concepts Recap */}
                {isNewFormat && newContent?.key_concepts && newContent.key_concepts.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 flex items-center justify-center gap-2">
                      <Lightbulb className="w-3 h-3" /> {t.keyConceptsMastered}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {newContent.key_concepts.map((concept, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="glass-card p-6 bg-white/[0.02] max-w-2xl mx-auto border-white/5 text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 mb-3 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> {t.journeySummary}
                  </p>
                  <div className="text-base text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    &quot;{isNewFormat ? newContent?.summary : t.keepPracticing}&quot;
                  </div>
                </div>
              </div>

              {/* === LEVEL PROGRESSION PATH === */}
              {nextLevel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-8 relative overflow-hidden border-secondary/20 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-secondary">
                          {t.knowledgeAscension}
                        </p>
                      </div>

                      <h3 className="text-3xl font-black text-text-main">
                        {t.masteringTier} <span className="gradient-text capitalize">{nextLevel}</span> {t.tier}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                        {nextLevel === 'intermediate' 
                          ? t.intermediateDesc
                          : t.advancedDesc
                        }
                      </p>

                      {/* Creative "New Infos" Preview */}
                      <div className="pt-4 grid grid-cols-2 gap-3">
                         <div className="p-3 bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 mb-2">{t.upcomingFocus}</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {nextLevel === 'intermediate' ? `⚙️ ${t.operationalLogic}` : `🧩 ${t.systemicArchitecture}`}
                            </p>
                         </div>
                         <div className="p-3 bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 mb-2">{t.complexityShift}</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {nextLevel === 'intermediate' ? `📈 ${t.depthPlus}` : `🔥 ${t.expertInsights}`}
                            </p>
                         </div>
                      </div>
                    </div>

                    <button
                      onClick={handleLevelUp}
                      disabled={isLevelingUp}
                      className="btn-magic h-20 px-12 text-xl whitespace-nowrap flex items-center gap-4 shrink-0 shadow-neon-purple hover:scale-105 transition-all"
                    >
                      {isLevelingUp ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                      {isLevelingUp ? t.magicInProgress : `${t.levelUp} →`}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === RESOURCES SECTION === */}
              {isNewFormat && newContent?.resources && newContent.resources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/5" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Curated Resources to Go Deeper
                    </p>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {newContent.resources.map((resource, i) => {
                      const icons = {
                        video: <Youtube className="w-4 h-4 text-red-400" />,
                        article: <FileText className="w-4 h-4 text-blue-400" />,
                        book: <BookOpen className="w-4 h-4 text-amber-400" />,
                        tool: <Wrench className="w-4 h-4 text-emerald-400" />,
                      };
                      const colors = {
                        video: 'border-red-500/10 hover:border-red-500/30 bg-red-500/[0.03]',
                        article: 'border-blue-500/10 hover:border-blue-500/30 bg-blue-500/[0.03]',
                        book: 'border-amber-500/10 hover:border-amber-500/30 bg-amber-500/[0.03]',
                        tool: 'border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-500/[0.03]',
                      };
                      return (
                        <a
                          key={i}
                          href={ensureAbsoluteUrl(resource.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`relative z-30 group flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 pointer-events-auto ${colors[resource.type] || 'border-white/5 hover:border-white/20'}`}
                        >
                          <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-white/5">
                            {icons[resource.type] || <BookOpen className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-text-main group-hover:text-primary transition-colors truncate">{resource.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5 line-clamp-2">{resource.description}</p>
                            <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-600 capitalize">{resource.type} · {resource.difficulty}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* === BOTTOM ACTIONS === */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/dashboard" className="btn-magic h-14 px-10 text-base tracking-tighter flex items-center justify-center gap-3">
                  {t.backToHQ}
                </Link>
                {!nextLevel && (
                  <Link href="/lesson/new" className="glass h-14 px-10 rounded-2xl font-bold flex items-center justify-center border-white/10 hover:border-white/30 transition-all text-base gap-2">
                    <Sparkles className="w-4 h-4" />
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


