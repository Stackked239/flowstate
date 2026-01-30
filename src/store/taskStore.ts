import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Project, Label } from '@/types';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  selectedProject: string | null;
  selectedLabel: string | null;
  searchQuery: string;
  showCompleted: boolean;
  focusMode: boolean;
  currentFocusTask: string | null;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'user_id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Label actions
  addLabel: (label: Omit<Label, 'id' | 'user_id'>) => void;
  deleteLabel: (id: string) => void;
  
  // Filter actions
  setSelectedProject: (id: string | null) => void;
  setSelectedLabel: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setShowCompleted: (show: boolean) => void;
  
  // Focus mode
  toggleFocusMode: () => void;
  setCurrentFocusTask: (id: string | null) => void;
  getNextTask: () => Task | null;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [
        { id: 'inbox', name: 'Inbox', color: '#6366f1', user_id: 'local', created_at: new Date().toISOString() }
      ],
      labels: [],
      selectedProject: null,
      selectedLabel: null,
      searchQuery: '',
      showCompleted: false,
      focusMode: false,
      currentFocusTask: null,

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'local',
          order: get().tasks.length,
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updated_at: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updated_at: new Date().toISOString() }
              : task
          ),
        }));
      },

      reorderTasks: (tasks) => {
        set({ tasks });
      },

      addProject: (projectData) => {
        const project: Project = {
          ...projectData,
          id: generateId(),
          created_at: new Date().toISOString(),
          user_id: 'local',
        };
        set((state) => ({ projects: [...state.projects, project] }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.map((task) =>
            task.project_id === id ? { ...task, project_id: 'inbox' } : task
          ),
        }));
      },

      addLabel: (labelData) => {
        const label: Label = {
          ...labelData,
          id: generateId(),
          user_id: 'local',
        };
        set((state) => ({ labels: [...state.labels, label] }));
      },

      deleteLabel: (id) => {
        set((state) => ({
          labels: state.labels.filter((label) => label.id !== id),
          tasks: state.tasks.map((task) => ({
            ...task,
            labels: task.labels.filter((l) => l !== id),
          })),
        }));
      },

      setSelectedProject: (id) => set({ selectedProject: id }),
      setSelectedLabel: (id) => set({ selectedLabel: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setShowCompleted: (show) => set({ showCompleted: show }),

      toggleFocusMode: () => {
        const state = get();
        if (!state.focusMode) {
          const nextTask = state.getNextTask();
          set({ focusMode: true, currentFocusTask: nextTask?.id || null });
        } else {
          set({ focusMode: false, currentFocusTask: null });
        }
      },

      setCurrentFocusTask: (id) => set({ currentFocusTask: id }),

      getNextTask: () => {
        const state = get();
        const incompleteTasks = state.tasks
          .filter((t) => !t.completed)
          .sort((a, b) => {
            // Priority order: urgent > high > medium > low
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            // Then by due date
            if (a.due_date && b.due_date) {
              return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (a.due_date) return -1;
            if (b.due_date) return 1;
            // Then by creation order
            return a.order - b.order;
          });
        return incompleteTasks[0] || null;
      },
    }),
    {
      name: 'flowstate-storage',
    }
  )
);
