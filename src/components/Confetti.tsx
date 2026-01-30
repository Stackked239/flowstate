'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
];

const SHAPES = ['square', 'circle', 'triangle'];

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        });
      }
      setPieces(newPieces);

      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: piece.rotation + 720,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: 'linear',
          }}
          className="fixed top-0 pointer-events-none z-[100]"
          style={{
            width: 10 * piece.scale,
            height: 10 * piece.scale,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </AnimatePresence>
  );
}

// Achievement notification component
interface AchievementToastProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
  } | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    if (achievement) {
      const timeout = setTimeout(onClose, 4000);
      return () => clearTimeout(timeout);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl text-white">
            <div className="text-4xl">{achievement.icon}</div>
            <div>
              <div className="text-sm font-medium opacity-90">Achievement Unlocked!</div>
              <div className="text-lg font-bold">{achievement.name}</div>
              <div className="text-sm opacity-80">{achievement.description}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// XP gain animation
interface XPGainProps {
  amount: number | null;
  onComplete: () => void;
}

export function XPGain({ amount, onComplete }: XPGainProps) {
  useEffect(() => {
    if (amount) {
      const timeout = setTimeout(onComplete, 1500);
      return () => clearTimeout(timeout);
    }
  }, [amount, onComplete]);

  return (
    <AnimatePresence>
      {amount && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 pointer-events-none z-[100]"
        >
          <div className="px-4 py-2 bg-indigo-500 text-white rounded-full font-bold text-lg shadow-lg">
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Level up celebration
interface LevelUpProps {
  level: number | null;
  onComplete: () => void;
}

export function LevelUp({ level, onComplete }: LevelUpProps) {
  useEffect(() => {
    if (level) {
      const timeout = setTimeout(onComplete, 3000);
      return () => clearTimeout(timeout);
    }
  }, [level, onComplete]);

  return (
    <AnimatePresence>
      {level && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100]"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <div className="text-yellow-400 text-2xl font-bold mb-2">LEVEL UP!</div>
            <div className="text-white text-6xl font-black">Level {level}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
