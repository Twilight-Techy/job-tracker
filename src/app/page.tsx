"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  RocketLaunch, 
  Robot, 
  FilePdf, 
  Moon, 
  Sun,
  Kanban,
  ChartLineUp,
  FolderOpen
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <header className="relative z-10 w-full p-6 flex justify-between items-center backdrop-blur-md border-b border-border/40">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-black tracking-tighter"
        >
          Job<span className="text-primary">Tracker</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun size={20} weight="bold" className="text-primary" />
              ) : (
                <Moon size={20} weight="bold" className="text-primary" />
              )}
            </button>
          )}

          <div className="flex gap-3">
            <Link 
              href="/auth/signin" 
              className="px-5 py-2 rounded-full font-medium text-sm hover:bg-muted transition-colors border border-border"
            >
              Log In
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-5 py-2 rounded-full font-medium text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <RocketLaunch size={18} weight="duotone" />
            <span>The future of job hunting</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Supercharge Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Job Search Journey
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Track applications, generate AI-optimized resumes, and manage interviews—all seamlessly collaborated with your preferred AI agent.
          </p>
          
          <div className="pt-8 flex flex-wrap gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="px-8 py-4 rounded-full font-bold text-lg bg-primary text-primary-foreground hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              Get Started for Free
            </Link>
            <Link 
              href="/dashboard" 
              className="px-8 py-4 rounded-full font-bold text-lg bg-card border border-border hover:bg-muted transition-all duration-300"
            >
              Enter Workspace
            </Link>
          </div>
        </motion.div>

        <div className="w-full mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            {
              icon: Kanban,
              title: "Smart Tracking",
              desc: "Keep all your job applications organized in one sleek dashboard with dynamic currency conversions."
            },
            {
              icon: FilePdf,
              title: "Dynamic Resumes",
              desc: "Create, preview, and generate actual PDFs tailored for targeted roles instantly."
            },
            {
              icon: Robot,
              title: "AI-Agent Ready",
              desc: "Plug in your own AI agent using a secure API Key to automate updates and sync data from GitHub/LinkedIn."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="p-8 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                <feature.icon size={28} weight="duotone" className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center text-muted-foreground font-medium">
        <p>&copy; {new Date().getFullYear()} JobTracker. Built with Next.js & Neon.</p>
      </footer>
    </div>
  );
}
