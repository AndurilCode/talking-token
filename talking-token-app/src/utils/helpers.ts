/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Calculates the position of participants in a circle
 */
export const calculateCirclePosition = (
  index: number, 
  total: number, 
  radius: number
): { x: number; y: number } => {
  const angle = (index / total) * 2 * Math.PI;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  return { x, y };
};

// Cache for localStorage to prevent unnecessary stringification
const localStorageCache: Record<string, string> = {};

/**
 * Saves data to localStorage with caching to prevent unnecessary operations
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const jsonData = JSON.stringify(data);
    
    // Only update localStorage if the data has changed
    if (localStorageCache[key] !== jsonData) {
      localStorage.setItem(key, jsonData);
      localStorageCache[key] = jsonData;
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Loads data from localStorage
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      localStorageCache[key] = storedData;
      return JSON.parse(storedData);
    }
    return defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}; 