'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Zap,
  Moon,
  Sun,
  Inbox,
  Calendar,
  FolderOpen,
  CheckCircle2,
  Settings,
  BarChart3,
  Trophy,
  Command,
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeToggle: () => void;
  onOpenStats: () => void;
  theme: 'light' | 'dark';
}

interface Command {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
}

export function CommandPalette({
  isOpen,
  onClose,
  onThemeToggle,
  onOpenStats,
  theme,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    setSelectedProject,
    toggleFocusMode,
    addTask,
    tasks,
  } = useTaskStore();

  const commands: Command[] = useMemo(() => [
    {
      id: 'add-task',
      name: 'Add new task',
      description: 'Create a new task',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'N',
      action: () => {
        onClose();
        // Focus the add task input
        setTimeout(() => {
          document.querySelector<HTMLInputElement>('[data-add-task]')?.focus();
        }, 100);
      },
      category: 'actions',
    },
    {
      id: 'focus-mode',
      name: 'Toggle Focus Mode',
      description: 'Enter distraction-free mode',
      icon: <Zap className="w-4 h-4" />,
      shortcut: 'F',
      action: () => {
        toggleFocusMode();
        onClose();
      },
      category: 'actions',
    },
    {
      id: 'view-stats',
      name: 'View Statistics',
      description: 'See your productivity stats',
      icon: <BarChart3 className="w-4 h-4" />,
      shortcut: 'S',
      action: () => {
        onOpenStats();
        onClose();
      },
      category: 'actions',
    },
    {
      id: 'go-inbox',
      name: 'Go to Inbox',
      icon: <Inbox className="w-4 h-4" />,
      action: () => {
        setSelectedProject('inbox');
        onClose();
      },
      category: 'navigation',
    },
    {
      id: 'go-today',
      name: 'Go to Today',
      icon: <Calendar className="w-4 h-4" />,
      shortcut: 'T',
      action: () => {
        setSelectedProject('today');
        onClose();
      },
      category: 'navigation',
    },
    {
      id: 'go-all',
      name: 'View All Tasks',
      icon: <CheckCircle2 className="w-4 h-4" />,
      action: () => {
        setSelectedProject(null);
        onClose();
      },
      category: 'navigation',
    },
    {
      id: 'toggle-theme',
      name: theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode',
      icon: theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
      shortcut: 'D',
      action: () => {
        onThemeToggle();
        onClose();
      },
      category: 'settings',
    },
  ], [theme, onClose, onThemeToggle, onOpenStats, setSelectedProject, toggleFocusMode]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Also search tasks
  const matchingTasks = useMemo(() => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return tasks
      .filter((t) => t.title.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  }, [tasks, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const totalItems = filteredCommands.length + matchingTasks.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex < filteredCommands.length) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  const groupedCommands = {
    actions: filteredCommands.filter((c) => c.category === 'actions'),
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    settings: filteredCommands.filter((c) => c.category === 'settings'),
  };

  let currentIndex = 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
              <Command className="w-3 h-3" />K
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {/* Quick Actions */}
            {groupedCommands.actions.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Quick Actions
                </div>
                {groupedCommands.actions.map((cmd) => {
                  const index = currentIndex++;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        selectedIndex === index
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className={cn(
                        'p-1.5 rounded-lg',
                        selectedIndex === index
                          ? 'bg-indigo-100 dark:bg-indigo-900/50'
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{cmd.name}</div>
                        {cmd.description && (
                          <div className="text-xs text-gray-500">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            {groupedCommands.navigation.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Navigation
                </div>
                {groupedCommands.navigation.map((cmd) => {
                  const index = currentIndex++;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        selectedIndex === index
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className={cn(
                        'p-1.5 rounded-lg',
                        selectedIndex === index
                          ? 'bg-indigo-100 dark:bg-indigo-900/50'
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1 text-left font-medium">{cmd.name}</span>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Settings */}
            {groupedCommands.settings.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Settings
                </div>
                {groupedCommands.settings.map((cmd) => {
                  const index = currentIndex++;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        selectedIndex === index
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <span className={cn(
                        'p-1.5 rounded-lg',
                        selectedIndex === index
                          ? 'bg-indigo-100 dark:bg-indigo-900/50'
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1 text-left font-medium">{cmd.name}</span>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Matching Tasks */}
            {matchingTasks.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tasks
                </div>
                {matchingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className={cn(
                      'w-4 h-4',
                      task.completed ? 'text-green-500' : 'text-gray-400'
                    )} />
                    <span className={cn(task.completed && 'line-through opacity-60')}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {filteredCommands.length === 0 && matchingTasks.length === 0 && (
              <div className="px-3 py-8 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">esc</kbd>
              close
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
