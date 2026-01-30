export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: string;
  labels: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  user_id: string;
  created_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  focus_mode_duration: number;
  daily_goal: number;
  show_completed: boolean;
}
