'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Calendar,
  Target,
  FolderOpen,
  Plus,
  Tag,
  ChevronDown,
  ChevronRight,
  Settings,
  Zap,
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const {
    projects,
    labels,
    selectedProject,
    selectedLabel,
    setSelectedProject,
    setSelectedLabel,
    tasks,
    toggleFocusMode,
    focusMode,
    addProject,
  } = useTaskStore();

  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [labelsExpanded, setLabelsExpanded] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const inboxCount = tasks.filter((t) => !t.completed && (!t.project_id || t.project_id === 'inbox')).length;
  const todayCount = tasks.filter((t) => {
    if (t.completed) return false;
    if (!t.due_date) return false;
    const today = new Date().toDateString();
    return new Date(t.due_date).toDateString() === today;
  }).length;

  const handleProjectClick = (projectId: string | null) => {
    setSelectedProject(projectId);
    setSelectedLabel(null);
    onClose?.();
  };

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject({
        name: newProjectName.trim(),
        color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      });
      setNewProjectName('');
      setShowNewProject(false);
    }
  };

  return (
    <aside className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Flowstate
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Focus Mode Button */}
        <button
          onClick={() => toggleFocusMode()}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors',
            focusMode
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          )}
        >
          <Zap className={cn('w-5 h-5', focusMode && 'text-indigo-500')} />
          <span className="font-medium">Focus Mode</span>
          {focusMode && (
            <span className="ml-auto text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">
              ON
            </span>
          )}
        </button>

        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

        {/* Quick Access */}
        <div className="space-y-1">
          <button
            onClick={() => handleProjectClick(null)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              selectedProject === null && !selectedLabel
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
          >
            <Inbox className="w-5 h-5" />
            <span>All Tasks</span>
            <span className="ml-auto text-sm text-gray-500">{tasks.filter(t => !t.completed).length}</span>
          </button>

          <button
            onClick={() => handleProjectClick('inbox')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              selectedProject === 'inbox'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
          >
            <Inbox className="w-5 h-5 text-indigo-500" />
            <span>Inbox</span>
            {inboxCount > 0 && (
              <span className="ml-auto text-sm text-gray-500">{inboxCount}</span>
            )}
          </button>

          <button
            onClick={() => handleProjectClick('today')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              selectedProject === 'today'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
          >
            <Calendar className="w-5 h-5 text-green-500" />
            <span>Today</span>
            {todayCount > 0 && (
              <span className="ml-auto text-sm text-gray-500">{todayCount}</span>
            )}
          </button>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800 my-3" />

        {/* Projects */}
        <div>
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {projectsExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <FolderOpen className="w-4 h-4" />
            <span>Projects</span>
            <Plus
              className="w-4 h-4 ml-auto hover:text-indigo-500"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewProject(true);
                setProjectsExpanded(true);
              }}
            />
          </button>

          <AnimatePresence>
            {projectsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 pl-4">
                  {projects.filter(p => p.id !== 'inbox').map((project) => {
                    const count = tasks.filter(
                      (t) => !t.completed && t.project_id === project.id
                    ).length;
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleProjectClick(project.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          selectedProject === project.id
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        )}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate">{project.name}</span>
                        {count > 0 && (
                          <span className="ml-auto text-sm text-gray-500">{count}</span>
                        )}
                      </button>
                    );
                  })}

                  {showNewProject && (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddProject();
                          if (e.key === 'Escape') {
                            setShowNewProject(false);
                            setNewProjectName('');
                          }
                        }}
                        placeholder="Project name"
                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800 my-3" />

        {/* Labels */}
        <div>
          <button
            onClick={() => setLabelsExpanded(!labelsExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {labelsExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Tag className="w-4 h-4" />
            <span>Labels</span>
          </button>

          <AnimatePresence>
            {labelsExpanded && labels.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 pl-4">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => {
                        setSelectedLabel(label.id);
                        setSelectedProject(null);
                        onClose?.();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        selectedLabel === label.id
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="truncate">{label.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
