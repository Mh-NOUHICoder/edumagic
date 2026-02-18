"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useUser, UserProfile } from "@clerk/nextjs";
import { useStore } from "@/lib/store";
import { translations } from "@/utils/translations";
import { dark } from "@clerk/themes";

export default function ProfilePage() {
  const { isLoaded } = useUser();
  const { language } = useStore();
  const t = translations[language];

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-500">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-24 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-black mb-2 gradient-text-premium">{t.profile}</h1>
            <p className="text-gray-400">Manage your account and learning preferences</p>
          </header>

          <div className="glass-card overflow-hidden">
             <UserProfile 
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: "#3B82F6",
                    colorBackground: "transparent",
                  },
                  elements: {
                    card: "bg-transparent shadow-none border-0",
                    navbar: "hidden", // Use our own sidebar-like layout if needed, or keep it simple
                    scrollBox: "bg-transparent",
                    pageScrollBox: "bg-transparent",
                  }
                }}
             />
          </div>
        </div>
      </main>
    </div>
  );
}
