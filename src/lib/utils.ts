import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseNaturalLanguageDate(input: string): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lowerInput = input.toLowerCase();
  
  // Today
  if (lowerInput.includes('today')) {
    return today;
  }
  
  // Tomorrow
  if (lowerInput.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // Next week
  if (lowerInput.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }
  
  // Days of the week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lowerInput.includes(days[i])) {
      const targetDay = i;
      const currentDay = today.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      
      if (lowerInput.includes('next')) {
        daysUntil += 7;
      }
      
      const result = new Date(today);
      result.setDate(result.getDate() + daysUntil);
      return result;
    }
  }
  
  // In X days
  const inDaysMatch = lowerInput.match(/in (\d+) days?/);
  if (inDaysMatch) {
    const result = new Date(today);
    result.setDate(result.getDate() + parseInt(inDaysMatch[1]));
    return result;
  }
  
  return null;
}

export function extractTaskFromNaturalLanguage(input: string): {
  title: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
} {
  let title = input;
  let dueDate: Date | null = null;
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  
  // Extract priority
  if (input.includes('!urgent') || input.includes('!!')) {
    priority = 'urgent';
    title = title.replace(/!urgent|!!/g, '').trim();
  } else if (input.includes('!high') || input.includes('!h')) {
    priority = 'high';
    title = title.replace(/!high|!h/g, '').trim();
  } else if (input.includes('!low') || input.includes('!l')) {
    priority = 'low';
    title = title.replace(/!low|!l/g, '').trim();
  }
  
  // Extract date patterns
  const datePatterns = [
    /\b(today|tomorrow|next week)\b/i,
    /\b(next )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\bin (\d+) days?\b/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = title.match(pattern);
    if (match) {
      dueDate = parseNaturalLanguageDate(match[0]);
      title = title.replace(pattern, '').trim();
    }
  }
  
  // Clean up extra whitespace
  title = title.replace(/\s+/g, ' ').trim();
  
  return { title, dueDate, priority };
}
