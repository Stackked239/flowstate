'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import {
  Circle,
  CheckCircle2,
  Calendar,
  Flag,
  MoreHorizontal,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const priorityBgColors = {
  low: 'bg-gray-100 dark:bg-gray-800',
  medium: 'bg-blue-50 dark:bg-blue-900/20',
  high: 'bg-orange-50 dark:bg-orange-900/20',
  urgent: 'bg-red-50 dark:bg-red-900/20',
};

export function TaskItem({ task }: TaskItemProps) {
  const { toggleComplete, deleteTask, updateTask, projects } = useTaskStore();
  const { completeTask } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showMenu, setShowMenu] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const project = projects.find((p) => p.id === task.project_id);

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  const handleToggleComplete = () => {
    if (!task.completed) {
      // Task is being completed
      completeTask();
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1000);
    }
    toggleComplete(task.id);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-xl border transition-all',
        task.completed
          ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
          : cn(
              'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
              'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
            ),
        task.priority === 'urgent' && !task.completed && 'border-l-4 border-l-red-500'
      )}
    >
      {/* Completion celebration */}
      {justCompleted && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </motion.div>
      )}

      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={cn(
          'mt-0.5 flex-shrink-0 transition-all',
          task.completed
            ? 'text-green-500'
            : cn('text-gray-300 hover:text-gray-400', priorityColors[task.priority]),
          'hover:scale-110'
        )}
      >
        <motion.div
          whileTap={{ scale: 0.8 }}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </motion.div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') {
                setEditTitle(task.title);
                setIsEditing(false);
              }
            }}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        ) : (
          <p
            className={cn(
              'text-gray-900 dark:text-gray-100 transition-all',
              task.completed && 'line-through text-gray-500 dark:text-gray-500'
            )}
          >
            {task.title}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {task.due_date && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue && !task.completed
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Calendar className="w-3 h-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}

          {project && project.id !== 'inbox' && (
            <span
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </span>
          )}

          {task.priority !== 'medium' && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs px-1.5 py-0.5 rounded',
                priorityBgColors[task.priority],
                priorityColors[task.priority]
              )}
            >
              <Flag className="w-3 h-3" />
              {task.priority}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit2 className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => deleteTask(task.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
