'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  SkipForward,
  Clock,
  Zap,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { Confetti } from './Confetti';

const FOCUS_DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
];

export function FocusMode() {
  const {
    focusMode,
    toggleFocusMode,
    currentFocusTask,
    tasks,
    toggleComplete,
    getNextTask,
    setCurrentFocusTask,
  } = useTaskStore();

  const { completeTask, completeFocusSession } = useGameStore();

  const [completedCount, setCompletedCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Pomodoro state
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const task = tasks.find((t) => t.id === currentFocusTask);
  const remainingTasks = tasks.filter((t) => !t.completed).length;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      completeFocusSession(selectedDuration);
      if (soundEnabled) {
        playSound('complete');
      }
      // Show celebration
      setShowConfetti(true);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, selectedDuration, completeFocusSession, soundEnabled]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(selectedDuration * 60);
    setIsRunning(false);
  }, [selectedDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / (selectedDuration * 60);

  const playSound = useCallback((type: 'complete' | 'click') => {
    // Using Web Audio API for sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'complete') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }, []);

  const handleComplete = () => {
    if (task) {
      toggleComplete(task.id);
      completeTask();
      setCompletedCount((c) => c + 1);
      setShowCelebration(true);
      setShowConfetti(true);
      if (soundEnabled) playSound('complete');
      
      setTimeout(() => setShowCelebration(false), 1500);

      // Move to next task
      setTimeout(() => {
        const next = getNextTask();
        setCurrentFocusTask(next?.id || null);
      }, 500);
    }
  };

  const handleSkip = () => {
    if (soundEnabled) playSound('click');
    const incompleteTasks = tasks.filter((t) => !t.completed && t.id !== currentFocusTask);
    if (incompleteTasks.length > 0) {
      setCurrentFocusTask(incompleteTasks[0].id);
    }
  };

  const handleReset = () => {
    setTimeLeft(selectedDuration * 60);
    setIsRunning(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusMode) return;
      
      if (e.key === 'Enter' && task) {
        e.preventDefault();
        handleComplete();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsRunning((r) => !r);
      } else if (e.key === 'Escape') {
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, task, handleComplete, handleSkip, toggleFocusMode]);

  if (!focusMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 z-50 flex flex-col"
      >
        {/* Confetti */}
        <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6 text-white/60">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>{completedCount} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{remainingTasks} remaining</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleFocusMode}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-8">
          {task ? (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl w-full"
            >
              {/* Pomodoro Timer */}
              <div className="mb-8">
                {/* Duration selector */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {FOCUS_DURATIONS.map((d) => (
                    <button
                      key={d.minutes}
                      onClick={() => setSelectedDuration(d.minutes)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        selectedDuration === d.minutes
                          ? 'bg-white text-gray-900'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Timer display */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  {/* Progress ring */}
                  <svg className="w-48 h-48 -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={553}
                      strokeDashoffset={553 * (1 - progress)}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-mono font-bold text-white">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Timer controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => {
                      setIsRunning(!isRunning);
                      if (soundEnabled) playSound('click');
                    }}
                    className={cn(
                      'p-4 rounded-full transition-all',
                      isRunning
                        ? 'bg-orange-500 hover:bg-orange-400'
                        : 'bg-green-500 hover:bg-green-400'
                    )}
                  >
                    {isRunning ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                  <div className="w-12" /> {/* Spacer for symmetry */}
                </div>
              </div>

              {/* Priority indicator */}
              {task.priority === 'urgent' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-full mb-6"
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Urgent Priority</span>
                </motion.div>
              )}

              {/* Task title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                {task.title}
              </h1>

              {/* Description */}
              {task.description && (
                <p className="text-xl text-white/70 mb-8">{task.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-green-500/30 transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Mark Complete
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSkip}
                  className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip
                </motion.button>
              </div>

              {/* Keyboard hints */}
              <p className="mt-8 text-white/40 text-sm">
                <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Space</kbd> timer
                <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Enter</kbd> complete
                <kbd className="px-2 py-1 bg-white/10 rounded mx-1">→</kbd> skip
                <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Esc</kbd> exit
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-green-400" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-4">All Done! 🎉</h1>
              <p className="text-xl text-white/70 mb-8">
                You completed {completedCount} tasks this session. Great work!
              </p>
              <button
                onClick={toggleFocusMode}
                className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Exit Focus Mode
              </button>
            </motion.div>
          )}
        </div>

        {/* Celebration animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-8xl">✨</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
