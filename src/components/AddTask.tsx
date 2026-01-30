'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar,
  Flag,
  FolderOpen,
  X,
  Sparkles,
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { extractTaskFromNaturalLanguage } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AddTaskProps {
  defaultProjectId?: string;
}

export function AddTask({ defaultProjectId }: AddTaskProps) {
  const { addTask, projects, selectedProject } = useTaskStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [projectId, setProjectId] = useState<string>(defaultProjectId || selectedProject || 'inbox');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (selectedProject && selectedProject !== 'today') {
      setProjectId(selectedProject);
    }
  }, [selectedProject]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    // Parse natural language
    const parsed = extractTaskFromNaturalLanguage(title);
    
    addTask({
      title: parsed.title || title.trim(),
      completed: false,
      priority: parsed.priority || priority,
      due_date: parsed.dueDate?.toISOString() || dueDate || undefined,
      project_id: projectId,
      labels: [],
    });

    // Reset form
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setTitle('');
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-gray-400' },
    { value: 'medium', label: 'Medium', color: 'text-blue-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
  ] as const;

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add task</span>
        <span className="ml-auto text-xs text-gray-400">
          Try: "Call mom tomorrow !high"
        </span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-1 text-indigo-500" />
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done? Try natural language..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
          <button
            onClick={() => {
              setIsExpanded(false);
              setTitle('');
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hint */}
        <p className="mt-2 ml-8 text-xs text-gray-400">
          💡 Try: "tomorrow", "next monday", "!urgent", "!high"
        </p>
      </div>

      {/* Options bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {/* Due Date */}
        <div className="relative">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <button className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-colors',
            dueDate
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}>
            <Calendar className="w-4 h-4" />
            {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Due date'}
          </button>
        </div>

        {/* Priority */}
        <div className="relative">
          <button
            onClick={() => setShowPriorityMenu(!showPriorityMenu)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-colors',
              priority !== 'medium'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <Flag className={cn('w-4 h-4', priorityOptions.find(p => p.value === priority)?.color)} />
            {priorityOptions.find(p => p.value === priority)?.label}
          </button>

          <AnimatePresence>
            {showPriorityMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
              >
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPriority(option.value);
                      setShowPriorityMenu(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                      option.color
                    )}
                  >
                    <Flag className="w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Project */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            {projects.find(p => p.id === projectId)?.name || 'Inbox'}
          </button>

          <AnimatePresence>
            {showProjectMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[150px]"
              >
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setProjectId(project.id);
                      setShowProjectMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            title.trim()
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          )}
        >
          Add Task
        </button>
      </div>
    </motion.div>
  );
}
