"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useStore();

  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update body class for font switching
    if (isRTL) {
      document.body.classList.add('font-arabic');
      document.body.classList.remove('font-latin');
    } else {
      document.body.classList.add('font-latin');
      document.body.classList.remove('font-arabic');
    }
  }, [language]);

  return <div className={language === 'ar' ? 'rtl-grid' : ''}>{children}</div>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00F2FF",
          colorBackground: "#0D1117",
          colorInputBackground: "rgba(255, 255, 255, 0.03)",
          colorInputText: "#FFFFFF",
          borderRadius: "1rem",
        },
        elements: {
          formButtonPrimary: "bg-linear-to-r from-[#00F2FF] to-[#7000FF] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] border-0 text-black font-black transition-all",
          card: "bg-[#0D1117]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2rem]",
          headerTitle: "text-3xl font-black tracking-tighter text-white",
          headerSubtitle: "text-slate-400 font-medium",
          socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl",
          socialButtonsBlockButtonText: "text-white font-bold",
          formFieldInput: "bg-white/5 border-white/10 focus:border-[#00F2FF] text-white rounded-xl",
          formFieldLabel: "text-slate-300 font-bold mb-1",
          footerActionLink: "text-[#00F2FF] hover:text-[#00D1DB] font-black",
          dividerLine: "bg-white/10",
          dividerText: "text-slate-500 font-bold",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LanguageWrapper>
            {children}
          </LanguageWrapper>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 6000,
              className: 'glass-card text-text-main font-bold border-black/5 dark:border-white/10 shadow-2xl',
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                backdropFilter: 'blur(16px)',
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
