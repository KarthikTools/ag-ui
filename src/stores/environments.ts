import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Environment, EnvironmentVariable } from '../types'
import { generateId } from '../utils/id'
import { saveToStorage, loadFromStorage, StorageKeys } from '../utils/storage'

export const useEnvironmentsStore = defineStore('environments', () => {
  const environments = ref<Environment[]>(loadFromStorage(StorageKeys.ENVIRONMENTS, []))
  const activeEnvironmentId = ref<string | null>(loadFromStorage(StorageKeys.ACTIVE_ENV, null))

  // Computed
  const allEnvironments = computed(() => environments.value)
  
  const activeEnvironment = computed(() => {
    if (!activeEnvironmentId.value) return null
    return environments.value.find(env => env.id === activeEnvironmentId.value) || null
  })

  // Actions
  function createEnvironment(name: string): Environment {
    const environment: Environment = {
      id: generateId(),
      name,
      variables: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    environments.value.push(environment)
    persist()
    return environment
  }

  function updateEnvironment(id: string, updates: Partial<Environment>): void {
    const index = environments.value.findIndex(env => env.id === id)
    if (index !== -1) {
      environments.value[index] = {
        ...environments.value[index],
        ...updates,
        updatedAt: Date.now(),
      }
      persist()
    }
  }

  function deleteEnvironment(id: string): void {
    const index = environments.value.findIndex(env => env.id === id)
    if (index !== -1) {
      environments.value.splice(index, 1)
      if (activeEnvironmentId.value === id) {
        activeEnvironmentId.value = null
        persistActiveEnv()
      }
      persist()
    }
  }

  function setActiveEnvironment(id: string | null): void {
    activeEnvironmentId.value = id
    persistActiveEnv()
  }

  function addVariable(environmentId: string, key: string, value: string, type: 'default' | 'secret' = 'default'): void {
    const environment = environments.value.find(env => env.id === environmentId)
    if (environment) {
      const variable: EnvironmentVariable = {
        id: generateId(),
        key,
        value,
        type,
        enabled: true,
      }
      environment.variables.push(variable)
      environment.updatedAt = Date.now()
      persist()
    }
  }

  function updateVariable(environmentId: string, variableId: string, updates: Partial<EnvironmentVariable>): void {
    const environment = environments.value.find(env => env.id === environmentId)
    if (environment) {
      const index = environment.variables.findIndex(v => v.id === variableId)
      if (index !== -1) {
        environment.variables[index] = {
          ...environment.variables[index],
          ...updates,
        }
        environment.updatedAt = Date.now()
        persist()
      }
    }
  }

  function deleteVariable(environmentId: string, variableId: string): void {
    const environment = environments.value.find(env => env.id === environmentId)
    if (environment) {
      const index = environment.variables.findIndex(v => v.id === variableId)
      if (index !== -1) {
        environment.variables.splice(index, 1)
        environment.updatedAt = Date.now()
        persist()
      }
    }
  }

  function duplicateEnvironment(id: string): void {
    const environment = environments.value.find(env => env.id === id)
    if (environment) {
      const duplicate: Environment = {
        ...JSON.parse(JSON.stringify(environment)),
        id: generateId(),
        name: `${environment.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      environments.value.push(duplicate)
      persist()
    }
  }

  function exportEnvironments(): string {
    return JSON.stringify(environments.value, null, 2)
  }

  function importEnvironments(data: string): void {
    try {
      const imported = JSON.parse(data) as Environment[]
      environments.value = [...environments.value, ...imported]
      persist()
    } catch (error) {
      console.error('Failed to import environments:', error)
      throw new Error('Invalid environment data')
    }
  }

  function persist(): void {
    saveToStorage(StorageKeys.ENVIRONMENTS, environments.value)
  }

  function persistActiveEnv(): void {
    saveToStorage(StorageKeys.ACTIVE_ENV, activeEnvironmentId.value)
  }

  return {
    environments,
    activeEnvironmentId,
    allEnvironments,
    activeEnvironment,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
    addVariable,
    updateVariable,
    deleteVariable,
    duplicateEnvironment,
    exportEnvironments,
    importEnvironments,
  }
})
