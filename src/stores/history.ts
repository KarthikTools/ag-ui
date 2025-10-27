import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryItem, HttpRequest, HttpResponse } from '../types'
import { generateId } from '../utils/id'
import { saveToStorage, loadFromStorage, StorageKeys } from '../utils/storage'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>(loadFromStorage(StorageKeys.HISTORY, []))
  const maxHistoryItems = 100

  // Computed
  const allHistory = computed(() => history.value)
  
  const recentHistory = computed(() => {
    return history.value.slice(0, 20)
  })

  // Actions
  function addToHistory(request: HttpRequest, response?: HttpResponse, error?: string): void {
    const item: HistoryItem = {
      id: generateId(),
      request: JSON.parse(JSON.stringify(request)),
      response: response ? JSON.parse(JSON.stringify(response)) : undefined,
      error,
      timestamp: Date.now(),
    }
    
    history.value.unshift(item)
    
    // Keep only last N items
    if (history.value.length > maxHistoryItems) {
      history.value = history.value.slice(0, maxHistoryItems)
    }
    
    persist()
  }

  function deleteHistoryItem(id: string): void {
    const index = history.value.findIndex(item => item.id === id)
    if (index !== -1) {
      history.value.splice(index, 1)
      persist()
    }
  }

  function clearHistory(): void {
    history.value = []
    persist()
  }

  function searchHistory(query: string): HistoryItem[] {
    const lowerQuery = query.toLowerCase()
    return history.value.filter(item => 
      item.request.url.toLowerCase().includes(lowerQuery) ||
      item.request.name.toLowerCase().includes(lowerQuery) ||
      item.request.method.toLowerCase().includes(lowerQuery)
    )
  }

  function exportHistory(): string {
    return JSON.stringify(history.value, null, 2)
  }

  function persist(): void {
    saveToStorage(StorageKeys.HISTORY, history.value)
  }

  return {
    history,
    allHistory,
    recentHistory,
    addToHistory,
    deleteHistoryItem,
    clearHistory,
    searchHistory,
    exportHistory,
  }
})
