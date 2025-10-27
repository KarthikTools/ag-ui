import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Collection, CollectionFolder, Request, HttpRequest } from '../types'
import { generateId } from '../utils/id'
import { saveToStorage, loadFromStorage, StorageKeys } from '../utils/storage'

export const useCollectionsStore = defineStore('collections', () => {
  const collections = ref<Collection[]>(loadFromStorage(StorageKeys.COLLECTIONS, []))

  // Computed
  const allCollections = computed(() => collections.value)
  
  const totalRequests = computed(() => {
    let count = 0
    collections.value.forEach(col => {
      count += col.requests.length
      col.folders.forEach(folder => {
        count += countRequestsInFolder(folder)
      })
    })
    return count
  })

  // Helper function
  function countRequestsInFolder(folder: CollectionFolder): number {
    let count = folder.requests.length
    folder.folders.forEach(subFolder => {
      count += countRequestsInFolder(subFolder)
    })
    return count
  }

  // Actions
  function createCollection(name: string, description?: string): Collection {
    const collection: Collection = {
      id: generateId(),
      name,
      description,
      folders: [],
      requests: [],
      expanded: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    collections.value.push(collection)
    persist()
    return collection
  }

  function updateCollection(id: string, updates: Partial<Collection>): void {
    const index = collections.value.findIndex(c => c.id === id)
    if (index !== -1) {
      collections.value[index] = {
        ...collections.value[index],
        ...updates,
        updatedAt: Date.now(),
      }
      persist()
    }
  }

  function deleteCollection(id: string): void {
    const index = collections.value.findIndex(c => c.id === id)
    if (index !== -1) {
      collections.value.splice(index, 1)
      persist()
    }
  }

  function addRequestToCollection(collectionId: string, request: Request): void {
    const collection = collections.value.find(c => c.id === collectionId)
    if (collection) {
      collection.requests.push(request)
      collection.updatedAt = Date.now()
      persist()
    }
  }

  function addFolderToCollection(collectionId: string, folderName: string): CollectionFolder {
    const collection = collections.value.find(c => c.id === collectionId)
    if (collection) {
      const folder: CollectionFolder = {
        id: generateId(),
        name: folderName,
        folders: [],
        requests: [],
        expanded: true,
      }
      collection.folders.push(folder)
      collection.updatedAt = Date.now()
      persist()
      return folder
    }
    throw new Error('Collection not found')
  }

  function deleteRequest(collectionId: string, requestId: string): void {
    const collection = collections.value.find(c => c.id === collectionId)
    if (collection) {
      // Check in root requests
      const index = collection.requests.findIndex(r => r.id === requestId)
      if (index !== -1) {
        collection.requests.splice(index, 1)
        collection.updatedAt = Date.now()
        persist()
        return
      }
      
      // Check in folders
      deleteRequestFromFolder(collection.folders, requestId)
      collection.updatedAt = Date.now()
      persist()
    }
  }

  function deleteRequestFromFolder(folders: CollectionFolder[], requestId: string): boolean {
    for (const folder of folders) {
      const index = folder.requests.findIndex(r => r.id === requestId)
      if (index !== -1) {
        folder.requests.splice(index, 1)
        return true
      }
      if (deleteRequestFromFolder(folder.folders, requestId)) {
        return true
      }
    }
    return false
  }

  function duplicateRequest(collectionId: string, requestId: string): void {
    const collection = collections.value.find(c => c.id === collectionId)
    if (collection) {
      const request = findRequestInCollection(collection, requestId)
      if (request && request.protocolType === 'http') {
        const duplicate: HttpRequest = {
          ...JSON.parse(JSON.stringify(request)),
          id: generateId(),
          name: `${request.name} (Copy)`,
        }
        collection.requests.push(duplicate)
        collection.updatedAt = Date.now()
        persist()
      }
    }
  }

  function findRequestInCollection(collection: Collection, requestId: string): Request | null {
    const request = collection.requests.find(r => r.id === requestId)
    if (request) return request
    
    for (const folder of collection.folders) {
      const found = findRequestInFolder(folder, requestId)
      if (found) return found
    }
    
    return null
  }

  function findRequestInFolder(folder: CollectionFolder, requestId: string): Request | null {
    const request = folder.requests.find(r => r.id === requestId)
    if (request) return request
    
    for (const subFolder of folder.folders) {
      const found = findRequestInFolder(subFolder, requestId)
      if (found) return found
    }
    
    return null
  }

  function exportCollections(): string {
    return JSON.stringify(collections.value, null, 2)
  }

  function importCollections(data: string): void {
    try {
      const imported = JSON.parse(data) as Collection[]
      collections.value = [...collections.value, ...imported]
      persist()
    } catch (error) {
      console.error('Failed to import collections:', error)
      throw new Error('Invalid collection data')
    }
  }

  function persist(): void {
    saveToStorage(StorageKeys.COLLECTIONS, collections.value)
  }

  return {
    collections,
    allCollections,
    totalRequests,
    createCollection,
    updateCollection,
    deleteCollection,
    addRequestToCollection,
    addFolderToCollection,
    deleteRequest,
    duplicateRequest,
    findRequestInCollection,
    exportCollections,
    importCollections,
  }
})
