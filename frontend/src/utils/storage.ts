import type { SavedCalculation, StorageData } from '../types';

const STORAGE_KEY = 'financial-calculator-data';
const HISTORY_KEY = 'calc_history';
const PREFS_KEY = 'user_prefs';

// ========================================
// 📚 History Management (NEW)
// ========================================
export interface CalculationHistory {
  id: string;
  type: 'credit-card' | 'student-loan';
  timestamp: number;
  inputs: any;
  results: any;
  note?: string;
}

export const getHistory = (): CalculationHistory[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveToHistory = (calc: CalculationHistory) => {
  try {
    const history = getHistory();
    history.unshift(calc);
    // Keep last 50 calculations
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

export const exportHistory = () => {
  const history = getHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calculator-history-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importHistory = (file: File) => {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const history = JSON.parse(e.target?.result as string);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// ========================================
// ⚙️ User Preferences (NEW)
// ========================================
export interface UserPreferences {
  defaultCurrency: 'THB';
  darkMode: boolean;
  showAIProfile: boolean;
  chartType: 'line' | 'bar';
  notifications: boolean;
}

export const getPreferences = (): UserPreferences => {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? JSON.parse(data) : {
      defaultCurrency: 'THB' as const,
      darkMode: false,
      showAIProfile: true,
      chartType: 'line' as const,
      notifications: true
    };
  } catch {
    return {
      defaultCurrency: 'THB' as const,
      darkMode: false,
      showAIProfile: true,
      chartType: 'line' as const,
      notifications: true
    };
  }
};

export const savePreferences = (prefs: Partial<UserPreferences>) => {
  try {
    const current = getPreferences();
    localStorage.setItem(PREFS_KEY, JSON.stringify({...current, ...prefs}));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
};

// ========================================
// 📊 Original Storage Functions
// ========================================

// ใช้ localStorage แทน window.storage
export function saveCalculation(calculation: SavedCalculation): void {
  try {
    const existingData = getStorageData();
    existingData.calculations.unshift(calculation);
    existingData.stats.totalCalculations++;
    existingData.stats.lastCalculation = Date.now();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
  } catch (error) {
    console.error('Failed to save calculation:', error);
  }
}

export function getStorageData(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No existing data found, creating new storage');
  }
  
  return {
    calculations: [],
    stats: {
      totalCalculations: 0,
      lastCalculation: 0
    }
  };
}

export function deleteCalculation(id: string): void {
  try {
    const data = getStorageData();
    data.calculations = data.calculations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to delete calculation:', error);
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}