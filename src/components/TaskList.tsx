'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import { Inbox, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from './TaskItem';
import { AddTask } from './AddTask';
import { cn } from '@/lib/utils';

export function TaskList() {
  const {
    tasks,
    selectedProject,
    selectedLabel,
    searchQuery,
    showCompleted,
    projects,
  } = useTaskStore();

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Filter by project
    if (selectedProject === 'today') {
      filtered = filtered.filter((task) => {
        if (!task.due_date) return false;
        return isToday(new Date(task.due_date));
      });
    } else if (selectedProject === 'inbox') {
      filtered = filtered.filter(
        (task) => !task.project_id || task.project_id === 'inbox'
      );
    } else if (selectedProject) {
      filtered = filtered.filter((task) => task.project_id === selectedProject);
    }

    // Filter by label
    if (selectedLabel) {
      filtered = filtered.filter((task) => task.labels.includes(selectedLabel));
    }

    // Filter completed
    if (!showCompleted) {
      filtered = filtered.filter((task) => !task.completed);
    }

    return filtered;
  }, [tasks, selectedProject, selectedLabel, searchQuery, showCompleted]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    const overdue: typeof tasks = [];
    const today: typeof tasks = [];
    const tomorrow: typeof tasks = [];
    const upcoming: typeof tasks = [];
    const noDue: typeof tasks = [];
    const completed: typeof tasks = [];

    filteredTasks.forEach((task) => {
      if (task.completed) {
        completed.push(task);
        return;
      }

      if (!task.due_date) {
        noDue.push(task);
        return;
      }

      const dueDate = new Date(task.due_date);

      if (isPast(dueDate) && !isToday(dueDate)) {
        overdue.push(task);
      } else if (isToday(dueDate)) {
        today.push(task);
      } else if (isTomorrow(dueDate)) {
        tomorrow.push(task);
      } else {
        upcoming.push(task);
      }
    });

    // Sort each group by priority then order
    const sortByPriority = (a: (typeof tasks)[0], b: (typeof tasks)[0]) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.order - b.order;
    };

    return {
      overdue: overdue.sort(sortByPriority),
      today: today.sort(sortByPriority),
      tomorrow: tomorrow.sort(sortByPriority),
      upcoming: upcoming.sort(sortByPriority),
      noDue: noDue.sort(sortByPriority),
      completed: completed.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    };
  }, [filteredTasks]);

  const getTitle = () => {
    if (selectedProject === 'today') return 'Today';
    if (selectedProject === 'inbox') return 'Inbox';
    if (selectedProject) {
      const project = projects.find((p) => p.id === selectedProject);
      return project?.name || 'Tasks';
    }
    return 'All Tasks';
  };

  const getIcon = () => {
    if (selectedProject === 'today') return <Calendar className="w-6 h-6 text-green-500" />;
    if (selectedProject === 'inbox') return <Inbox className="w-6 h-6 text-indigo-500" />;
    return null;
  };

  const TaskGroup = ({
    title,
    tasks,
    icon,
    color,
  }: {
    title: string;
    tasks: typeof filteredTasks;
    icon: React.ReactNode;
    color: string;
  }) => {
    if (tasks.length === 0) return null;

    return (
      <div className="mb-6">
        <div className={cn('flex items-center gap-2 mb-3', color)}>
          {icon}
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm opacity-60">({tasks.length})</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {getIcon()}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredTasks.filter((t) => !t.completed).length} tasks
          </span>
        </div>

        {/* Add Task */}
        <div className="mb-6">
          <AddTask />
        </div>

        {/* Task Groups */}
        {groupedTasks.overdue.length > 0 && (
          <TaskGroup
            title="Overdue"
            tasks={groupedTasks.overdue}
            icon={<Clock className="w-5 h-5" />}
            color="text-red-500"
          />
        )}

        {groupedTasks.today.length > 0 && (
          <TaskGroup
            title="Today"
            tasks={groupedTasks.today}
            icon={<Calendar className="w-5 h-5" />}
            color="text-green-500"
          />
        )}

        {groupedTasks.tomorrow.length > 0 && (
          <TaskGroup
            title="Tomorrow"
            tasks={groupedTasks.tomorrow}
            icon={<Calendar className="w-5 h-5" />}
            color="text-blue-500"
          />
        )}

        {groupedTasks.upcoming.length > 0 && (
          <TaskGroup
            title="Upcoming"
            tasks={groupedTasks.upcoming}
            icon={<Calendar className="w-5 h-5" />}
            color="text-gray-500 dark:text-gray-400"
          />
        )}

        {groupedTasks.noDue.length > 0 && (
          <TaskGroup
            title="No due date"
            tasks={groupedTasks.noDue}
            icon={<Inbox className="w-5 h-5" />}
            color="text-gray-500 dark:text-gray-400"
          />
        )}

        {showCompleted && groupedTasks.completed.length > 0 && (
          <TaskGroup
            title="Completed"
            tasks={groupedTasks.completed}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="text-gray-400"
          />
        )}

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks here
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add a task above to get started
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
