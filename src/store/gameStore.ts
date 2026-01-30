import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: number;
  type: 'tasks_completed' | 'streak' | 'focus_sessions' | 'level';
}

interface GameState {
  xp: number;
  level: number;
  streak: number;
  lastCompletedDate: string | null;
  tasksCompletedToday: number;
  totalTasksCompleted: number;
  focusSessionsCompleted: number;
  totalFocusMinutes: number;
  achievements: Achievement[];
  unlockedAchievements: string[];
  
  // Actions
  addXP: (amount: number) => void;
  completeTask: () => void;
  completeFocusSession: (minutes: number) => void;
  checkStreak: () => void;
  checkAchievements: () => void;
  getXPForNextLevel: () => number;
  getLevelProgress: () => number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_task', name: 'First Step', description: 'Complete your first task', icon: '🎯', requirement: 1, type: 'tasks_completed' },
  { id: 'ten_tasks', name: 'Getting Started', description: 'Complete 10 tasks', icon: '⭐', requirement: 10, type: 'tasks_completed' },
  { id: 'fifty_tasks', name: 'Task Master', description: 'Complete 50 tasks', icon: '🏆', requirement: 50, type: 'tasks_completed' },
  { id: 'hundred_tasks', name: 'Centurion', description: 'Complete 100 tasks', icon: '💯', requirement: 100, type: 'tasks_completed' },
  { id: 'streak_3', name: 'On Fire', description: '3 day streak', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '⚡', requirement: 7, type: 'streak' },
  { id: 'streak_30', name: 'Unstoppable', description: '30 day streak', icon: '🌟', requirement: 30, type: 'streak' },
  { id: 'focus_5', name: 'Focused', description: 'Complete 5 focus sessions', icon: '🧘', requirement: 5, type: 'focus_sessions' },
  { id: 'focus_25', name: 'Deep Work', description: 'Complete 25 focus sessions', icon: '🧠', requirement: 25, type: 'focus_sessions' },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '✨', requirement: 5, type: 'level' },
  { id: 'level_10', name: 'Pro', description: 'Reach level 10', icon: '💎', requirement: 10, type: 'level' },
  { id: 'level_25', name: 'Legend', description: 'Reach level 25', icon: '👑', requirement: 25, type: 'level' },
];

const XP_PER_TASK = 25;
const XP_PER_FOCUS_MINUTE = 2;
const STREAK_BONUS_MULTIPLIER = 0.1; // 10% bonus per streak day

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastCompletedDate: null,
      tasksCompletedToday: 0,
      totalTasksCompleted: 0,
      focusSessionsCompleted: 0,
      totalFocusMinutes: 0,
      achievements: ACHIEVEMENTS,
      unlockedAchievements: [],

      addXP: (amount) => {
        const state = get();
        const streakBonus = Math.floor(amount * state.streak * STREAK_BONUS_MULTIPLIER);
        const totalXP = state.xp + amount + streakBonus;
        
        // Calculate new level
        let newLevel = state.level;
        let xpForNext = get().getXPForNextLevel();
        
        while (totalXP >= xpForNext) {
          newLevel++;
          xpForNext = 100 * Math.pow(newLevel, 1.5);
        }

        set({ xp: totalXP, level: newLevel });
        
        // Check level achievements
        get().checkAchievements();
      },

      completeTask: () => {
        const state = get();
        const today = new Date().toDateString();
        
        // Update streak
        if (state.lastCompletedDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (state.lastCompletedDate === yesterday.toDateString()) {
            set({ streak: state.streak + 1 });
          } else if (state.lastCompletedDate !== today) {
            set({ streak: 1 });
          }
          set({ tasksCompletedToday: 1, lastCompletedDate: today });
        } else {
          set({ tasksCompletedToday: state.tasksCompletedToday + 1 });
        }

        set({ totalTasksCompleted: state.totalTasksCompleted + 1 });
        get().addXP(XP_PER_TASK);
        get().checkAchievements();
      },

      completeFocusSession: (minutes) => {
        const state = get();
        set({
          focusSessionsCompleted: state.focusSessionsCompleted + 1,
          totalFocusMinutes: state.totalFocusMinutes + minutes,
        });
        get().addXP(minutes * XP_PER_FOCUS_MINUTE);
        get().checkAchievements();
      },

      checkStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (state.lastCompletedDate && 
            state.lastCompletedDate !== today && 
            state.lastCompletedDate !== yesterday.toDateString()) {
          set({ streak: 0 });
        }
      },

      checkAchievements: () => {
        const state = get();
        const newUnlocked: string[] = [];

        ACHIEVEMENTS.forEach((achievement) => {
          if (state.unlockedAchievements.includes(achievement.id)) return;

          let value = 0;
          switch (achievement.type) {
            case 'tasks_completed':
              value = state.totalTasksCompleted;
              break;
            case 'streak':
              value = state.streak;
              break;
            case 'focus_sessions':
              value = state.focusSessionsCompleted;
              break;
            case 'level':
              value = state.level;
              break;
          }

          if (value >= achievement.requirement) {
            newUnlocked.push(achievement.id);
          }
        });

        if (newUnlocked.length > 0) {
          set({
            unlockedAchievements: [...state.unlockedAchievements, ...newUnlocked],
          });
        }
      },

      getXPForNextLevel: () => {
        const level = get().level;
        return Math.floor(100 * Math.pow(level, 1.5));
      },

      getLevelProgress: () => {
        const state = get();
        const currentLevelXP = Math.floor(100 * Math.pow(state.level - 1, 1.5));
        const nextLevelXP = get().getXPForNextLevel();
        const progress = (state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
        return Math.min(Math.max(progress, 0), 1);
      },
    }),
    {
      name: 'flowstate-game',
    }
  )
);
