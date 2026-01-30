'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sidebar,
  Header,
  TaskList,
  FocusMode,
  CommandPalette,
  StatsPanel,
  Confetti,
  AchievementToast,
  XPGain,
  LevelUp,
} from '@/components';
import { useGameStore } from '@/store/gameStore';
import { useTaskStore } from '@/store/taskStore';

export default function AppPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  
  // Celebration states
  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{
    name: string;
    description: string;
    icon: string;
  } | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const { level, unlockedAchievements, achievements } = useGameStore();
  const prevLevel = useState(level)[0];
  const prevAchievements = useState(unlockedAchievements.length)[0];

  // Check for level ups and achievements
  useEffect(() => {
    if (mounted && level > prevLevel) {
      setLevelUp(level);
      setShowConfetti(true);
    }
  }, [level, prevLevel, mounted]);

  useEffect(() => {
    if (mounted && unlockedAchievements.length > prevAchievements) {
      const newUnlocked = unlockedAchievements[unlockedAchievements.length - 1];
      const achievement = achievements.find((a) => a.id === newUnlocked);
      if (achievement) {
        setNewAchievement({
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
        });
        setShowConfetti(true);
      }
    }
  }, [unlockedAchievements.length, prevAchievements, achievements, unlockedAchievements, mounted]);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('flowstate-theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Check streak on load
    useGameStore.getState().checkStreak();
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('flowstate-theme', theme);
    }
  }, [theme, mounted]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // Quick shortcuts when command palette is closed
      if (!commandPaletteOpen && !statsOpen) {
        if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
          const input = document.querySelector<HTMLInputElement>('[data-add-task]');
          if (document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            input?.focus();
          }
        }
        if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
          if (document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            useTaskStore.getState().toggleFocusMode();
          }
        }
        if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
          if (document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            setStatsOpen(true);
          }
        }
        if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
          if (document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            toggleTheme();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, statsOpen]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen bg-white">
        <div className="w-64 bg-gray-50 border-r border-gray-200" />
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Celebrations */}
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AchievementToast
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />
      <XPGain amount={xpGain} onComplete={() => setXpGain(null)} />
      <LevelUp level={levelUp} onComplete={() => setLevelUp(null)} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <main className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
          <TaskList />
        </main>
      </div>

      {/* Focus Mode Overlay */}
      <FocusMode />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onThemeToggle={toggleTheme}
        onOpenStats={() => setStatsOpen(true)}
        theme={theme}
      />

      {/* Stats Panel */}
      <StatsPanel isOpen={statsOpen} onClose={() => setStatsOpen(false)} />
    </div>
  );
}
