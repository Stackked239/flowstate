'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Menu,
  Sun,
  Moon,
  Eye,
  EyeOff,
  User,
  Command,
  Trophy,
  Flame,
  Star,
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function Header({ onMenuClick, theme, onThemeToggle }: HeaderProps) {
  const { searchQuery, setSearchQuery, showCompleted, setShowCompleted, tasks } = useTaskStore();
  const { level, streak, xp, getLevelProgress } = useGameStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const completedToday = tasks.filter((t) => {
    if (!t.completed) return false;
    const today = new Date().toDateString();
    return new Date(t.updated_at).toDateString() === today;
  }).length;

  const progress = getLevelProgress();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div
        className={cn(
          'flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          isSearchFocused
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-gray-800'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
        )}
      >
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search tasks..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
        />
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </div>

      {/* Level Badge */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="relative">
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">Lv. {level}</div>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {streak}
            </span>
          </div>
        )}

        {/* Today's progress */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Trophy className="w-4 h-4 text-green-500" />
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {completedToday} today
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Show completed toggle */}
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showCompleted
              ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title={showCompleted ? 'Hide completed' : 'Show completed'}
        >
          {showCompleted ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle theme (D)"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* User menu placeholder */}
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
