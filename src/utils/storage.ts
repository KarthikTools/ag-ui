// Local storage keys
const KEYS = {
  COLLECTIONS: 'api-executor-collections',
  ENVIRONMENTS: 'api-executor-environments',
  HISTORY: 'api-executor-history',
  SETTINGS: 'api-executor-settings',
  ACTIVE_ENV: 'api-executor-active-env',
  TABS: 'api-executor-tabs',
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Failed to load from storage:', error)
    return defaultValue
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove from storage:', error)
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}

export const StorageKeys = KEYS
