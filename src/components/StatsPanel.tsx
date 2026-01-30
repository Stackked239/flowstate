'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trophy,
  Zap,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Flame,
  Star,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsPanel({ isOpen, onClose }: StatsPanelProps) {
  const {
    xp,
    level,
    streak,
    totalTasksCompleted,
    tasksCompletedToday,
    focusSessionsCompleted,
    totalFocusMinutes,
    achievements,
    unlockedAchievements,
    getXPForNextLevel,
    getLevelProgress,
  } = useGameStore();

  const { tasks } = useTaskStore();

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
    : 0;

  const xpForNext = getXPForNextLevel();
  const progress = getLevelProgress();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-6">
              {/* Level Badge */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="text-4xl font-bold">{level}</div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                  LEVEL
                </div>
              </div>

              {/* XP Progress */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="text-lg font-semibold">{xp.toLocaleString()} XP</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {Math.round(xpForNext - (xp - Math.floor(100 * Math.pow(level - 1, 1.5))))} XP to level {level + 1}
                </div>
              </div>
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/30 rounded-full">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="font-semibold">{streak} day streak!</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Target className="w-5 h-5" />}
                label="Tasks Completed"
                value={totalTasksCompleted}
                color="indigo"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5" />}
                label="Done Today"
                value={tasksCompletedToday}
                color="green"
              />
              <StatCard
                icon={<Zap className="w-5 h-5" />}
                label="Focus Sessions"
                value={focusSessionsCompleted}
                color="purple"
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="Focus Minutes"
                value={totalFocusMinutes}
                color="blue"
              />
            </div>

            {/* Completion Rate */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Completion Rate
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {completionRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Achievements
                <span className="text-sm font-normal text-gray-500">
                  ({unlockedAchievements.length}/{achievements.length})
                </span>
              </h3>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {achievements.map((achievement) => {
                  const isUnlocked = unlockedAchievements.includes(achievement.id);
                  return (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        'relative p-4 rounded-xl text-center transition-all',
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800'
                          : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                      )}
                    >
                      <div className="text-3xl mb-2">
                        {isUnlocked ? achievement.icon : '🔒'}
                      </div>
                      <div className={cn(
                        'text-xs font-medium',
                        isUnlocked
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      )}>
                        {achievement.name}
                      </div>
                      {!isUnlocked && (
                        <div className="text-[10px] text-gray-400 mt-1">
                          {achievement.description}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'indigo' | 'green' | 'purple' | 'blue';
}) {
  const colors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      <div className={cn('inline-flex p-2 rounded-lg mb-2', colors[color])}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
