<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCollectionsStore } from './stores/collections'
import { useEnvironmentsStore } from './stores/environments'
import { useHistoryStore } from './stores/history'
import type { HttpRequest, HttpResponse, RequestHeader, RequestParam, AuthType, BodyType, CodeGenLanguage } from './types'
import { generateId } from './utils/id'
import { interpolateVariables } from './utils/variables'
import { generateCode } from './utils/codegen'
import axios from 'axios'

// Stores
const collectionsStore = useCollectionsStore()
const environmentsStore = useEnvironmentsStore()
const historyStore = useHistoryStore()

// UI State
const activeView = ref<'request' | 'collections' | 'environments' | 'history'>('request')
const activeTab = ref<'params' | 'headers' | 'body' | 'auth'>('params')
const responseTab = ref<'body' | 'headers' | 'raw'>('body')
const sidebarOpen = ref(true)
const showCodeGen = ref(false)
const showImportExport = ref(false)
const showNewCollection = ref(false)
const showNewEnvironment = ref(false)
const showSaveRequest = ref(false)

// Request State
const currentRequest = ref<HttpRequest>({
  id: generateId(),
  name: 'New Request',
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  params: [],
  headers: [{ id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true }],
  auth: { type: 'none' },
  body: { type: 'none', content: '' },
  preRequestScript: { enabled: false, script: '' },
  testScript: { enabled: false, script: '' },
  protocolType: 'http'
})

const response = ref<HttpResponse | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

// Code Generation
const codeGenLanguage = ref<CodeGenLanguage>('curl')
const generatedCode = computed(() => generateCode(currentRequest.value, codeGenLanguage.value))

// Import/Export
const importData = ref('')
const exportFormat = ref<'collections' | 'environments' | 'history' | 'all'>('collections')

// New Collection/Environment
const newCollectionName = ref('')
const newCollectionDesc = ref('')
const newEnvironmentName = ref('')
const newEnvVarKey = ref('')
const newEnvVarValue = ref('')

// Computed
const statusClass = computed(() => {
  if (!response.value) return ''
  const status = response.value.status
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'redirect'
  if (status >= 400 && status < 500) return 'client-error'
  return 'server-error'
})

const processedUrl = computed(() => {
  let url = currentRequest.value.url
  if (environmentsStore.activeEnvironment) {
    url = interpolateVariables(url, environmentsStore.activeEnvironment)
  }
  
  // Add query params
  const enabledParams = currentRequest.value.params.filter(p => p.enabled && p.key)
  if (enabledParams.length > 0) {
    const separator = url.includes('?') ? '&' : '?'
    const queryString = enabledParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
    url += separator + queryString
  }
  
  return url
})

// Actions
function addParam() {
  currentRequest.value.params.push({ id: generateId(), key: '', value: '', enabled: true })
}

function removeParam(id: string) {
  currentRequest.value.params = currentRequest.value.params.filter(p => p.id !== id)
}

function addHeader() {
  currentRequest.value.headers.push({ id: generateId(), key: '', value: '', enabled: true })
}

function removeHeader(id: string) {
  currentRequest.value.headers = currentRequest.value.headers.filter(h => h.id !== id)
}

function setAuthType(type: AuthType) {
  currentRequest.value.auth = { type }
}

function setBodyType(type: BodyType) {
  currentRequest.value.body.type = type
  if (type === 'none') {
    currentRequest.value.body.content = ''
  }
}

async function sendRequest() {
  loading.value = true
  response.value = null
  error.value = null

  const startTime = Date.now()

  try {
    // Process headers
    const headers: Record<string, string> = {}
    currentRequest.value.headers.filter(h => h.enabled && h.key).forEach(h => {
      let value = h.value
      if (environmentsStore.activeEnvironment) {
        value = interpolateVariables(value, environmentsStore.activeEnvironment)
      }
      headers[h.key] = value
    })

    // Process auth
    if (currentRequest.value.auth.type === 'basic' && currentRequest.value.auth.basic) {
      const { username, password } = currentRequest.value.auth.basic
      headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`)
    } else if (currentRequest.value.auth.type === 'bearer' && currentRequest.value.auth.bearer) {
      const prefix = currentRequest.value.auth.bearer.prefix || 'Bearer'
      headers['Authorization'] = `${prefix} ${currentRequest.value.auth.bearer.token}`
    } else if (currentRequest.value.auth.type === 'apikey' && currentRequest.value.auth.apikey) {
      if (currentRequest.value.auth.apikey.addTo === 'header') {
        headers[currentRequest.value.auth.apikey.key] = currentRequest.value.auth.apikey.value
      }
    }

    // Prepare request config
    const config: any = {
      method: currentRequest.value.method,
      url: processedUrl.value,
      headers,
    }

    // Add body
    if (['POST', 'PUT', 'PATCH'].includes(currentRequest.value.method) && currentRequest.value.body.type !== 'none') {
      let bodyContent = currentRequest.value.body.content
      if (environmentsStore.activeEnvironment) {
        bodyContent = interpolateVariables(bodyContent, environmentsStore.activeEnvironment)
      }
      
      if (currentRequest.value.body.type === 'json') {
        try {
          config.data = JSON.parse(bodyContent)
        } catch {
          config.data = bodyContent
        }
      } else {
        config.data = bodyContent
      }
    }

    const res = await axios(config)
    const duration = Date.now() - startTime

    response.value = {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers as Record<string, string>,
      data: res.data,
      size: JSON.stringify(res.data).length,
      duration,
      timestamp: Date.now()
    }

    // Add to history
    historyStore.addToHistory(currentRequest.value, response.value)
  } catch (err: any) {
    const duration = Date.now() - startTime
    
    if (err.response) {
      response.value = {
        status: err.response.status,
        statusText: err.response.statusText,
        headers: err.response.headers,
        data: err.response.data,
        size: JSON.stringify(err.response.data).length,
        duration,
        timestamp: Date.now()
      }
      historyStore.addToHistory(currentRequest.value, response.value)
    } else {
      error.value = err.message || 'Request failed'
      historyStore.addToHistory(currentRequest.value, undefined, error.value)
    }
  } finally {
    loading.value = false
  }
}

function formatJson(data: any): string {
  try {
    if (typeof data === 'string') {
      return JSON.stringify(JSON.parse(data), null, 2)
    }
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function createNewCollection() {
  if (newCollectionName.value.trim()) {
    collectionsStore.createCollection(newCollectionName.value, newCollectionDesc.value)
    newCollectionName.value = ''
    newCollectionDesc.value = ''
    showNewCollection.value = false
  }
}

function createNewEnvironment() {
  if (newEnvironmentName.value.trim()) {
    const env = environmentsStore.createEnvironment(newEnvironmentName.value)
    if (newEnvVarKey.value.trim()) {
      environmentsStore.addVariable(env.id, newEnvVarKey.value, newEnvVarValue.value)
    }
    newEnvironmentName.value = ''
    newEnvVarKey.value = ''
    newEnvVarValue.value = ''
    showNewEnvironment.value = false
  }
}

function saveCurrentRequest() {
  if (collectionsStore.collections.length === 0) {
    alert('Please create a collection first')
    return
  }
  showSaveRequest.value = true
}

function saveRequestToCollection(collectionId: string) {
  collectionsStore.addRequestToCollection(collectionId, currentRequest.value)
  showSaveRequest.value = false
}

function loadRequestFromHistory(historyItem: any) {
  currentRequest.value = JSON.parse(JSON.stringify(historyItem.request))
  response.value = historyItem.response ? JSON.parse(JSON.stringify(historyItem.response)) : null
  error.value = historyItem.error || null
  activeView.value = 'request'
}

function loadRequestFromCollection(request: any) {
  currentRequest.value = JSON.parse(JSON.stringify(request))
  response.value = null
  error.value = null
  activeView.value = 'request'
}

function exportData() {
  let data = ''
  switch (exportFormat.value) {
    case 'collections':
      data = collectionsStore.exportCollections()
      break
    case 'environments':
      data = environmentsStore.exportEnvironments()
      break
    case 'history':
      data = historyStore.exportHistory()
      break
    case 'all':
      data = JSON.stringify({
        collections: collectionsStore.collections,
        environments: environmentsStore.environments,
        history: historyStore.history
      }, null, 2)
      break
  }
  
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `api-executor-${exportFormat.value}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importDataFile() {
  try {
    const data = JSON.parse(importData.value)
    
    if (Array.isArray(data)) {
      // Try to determine type
      if (data[0]?.requests !== undefined) {
        collectionsStore.importCollections(importData.value)
      } else if (data[0]?.variables !== undefined) {
        environmentsStore.importEnvironments(importData.value)
      }
    } else if (data.collections || data.environments || data.history) {
      if (data.collections) {
        collectionsStore.importCollections(JSON.stringify(data.collections))
      }
      if (data.environments) {
        environmentsStore.importEnvironments(JSON.stringify(data.environments))
      }
    }
    
    importData.value = ''
    showImportExport.value = false
    alert('Import successful!')
  } catch (err) {
    alert('Import failed: Invalid JSON data')
  }
}
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button @click="sidebarOpen = !sidebarOpen" class="icon-btn">☰</button>
        <h1>🚀 API Executor</h1>
        <span class="badge">Bank Secure</span>
      </div>
      <div class="header-right">
        <select v-model="environmentsStore.activeEnvironmentId" class="env-select">
          <option :value="null">No Environment</option>
          <option v-for="env in environmentsStore.environments" :key="env.id" :value="env.id">
            {{ env.name }}
          </option>
        </select>
        <button @click="showCodeGen = true" class="icon-btn" title="Code Generation">{ }</button>
        <button @click="showImportExport = true" class="icon-btn" title="Import/Export">⇅</button>
      </div>
    </header>

    <div class="main-container">
      <!-- Sidebar -->
      <aside v-if="sidebarOpen" class="sidebar">
        <div class="sidebar-tabs">
          <button 
            :class="{ active: activeView === 'request' }" 
            @click="activeView = 'request'"
          >Request</button>
          <button 
            :class="{ active: activeView === 'collections' }" 
            @click="activeView = 'collections'"
          >Collections</button>
          <button 
            :class="{ active: activeView === 'environments' }" 
            @click="activeView = 'environments'"
          >Environments</button>
          <button 
            :class="{ active: activeView === 'history' }" 
            @click="activeView = 'history'"
          >History</button>
        </div>

        <!-- Collections View -->
        <div v-if="activeView === 'collections'" class="sidebar-content">
          <div class="sidebar-header">
            <h3>Collections</h3>
            <button @click="showNewCollection = true" class="btn-sm">+ New</button>
          </div>
          <div class="collections-list">
            <div v-for="collection in collectionsStore.collections" :key="collection.id" class="collection-item">
              <div class="collection-header">
                <span>📁 {{ collection.name }}</span>
                <button @click="collectionsStore.deleteCollection(collection.id)" class="btn-danger-sm">×</button>
              </div>
              <div v-if="collection.requests.length > 0" class="collection-requests">
                <div 
                  v-for="request in collection.requests" 
                  :key="request.id" 
                  class="request-item"
                  @click="loadRequestFromCollection(request)"
                >
                  <span class="method-badge" :class="request.method?.toLowerCase()">
                    {{ request.method }}
                  </span>
                  <span class="request-name">{{ request.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Environments View -->
        <div v-if="activeView === 'environments'" class="sidebar-content">
          <div class="sidebar-header">
            <h3>Environments</h3>
            <button @click="showNewEnvironment = true" class="btn-sm">+ New</button>
          </div>
          <div class="environments-list">
            <div v-for="env in environmentsStore.environments" :key="env.id" class="env-item">
              <div class="env-header">
                <span>🌍 {{ env.name }}</span>
                <button @click="environmentsStore.deleteEnvironment(env.id)" class="btn-danger-sm">×</button>
              </div>
              <div class="env-vars">
                <div v-for="variable in env.variables" :key="variable.id" class="var-item">
                  <span class="var-key">{{ variable.key }}</span>
                  <span class="var-value">{{ variable.type === 'secret' ? '••••••' : variable.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- History View -->
        <div v-if="activeView === 'history'" class="sidebar-content">
          <div class="sidebar-header">
            <h3>History</h3>
            <button @click="historyStore.clearHistory()" class="btn-danger-sm">Clear</button>
          </div>
          <div class="history-list">
            <div 
              v-for="item in historyStore.recentHistory" 
              :key="item.id" 
              class="history-item"
              @click="loadRequestFromHistory(item)"
            >
              <div class="history-header">
                <span class="method-badge" :class="item.request.method.toLowerCase()">
                  {{ item.request.method }}
                </span>
                <span class="history-url">{{ item.request.url }}</span>
              </div>
              <div class="history-meta">
                <span v-if="item.response" :class="['status-badge', item.response.status >= 200 && item.response.status < 300 ? 'success' : 'error']">
                  {{ item.response.status }}
                </span>
                <span class="history-time">{{ new Date(item.timestamp).toLocaleTimeString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="content">
        <!-- Request Builder -->
        <div class="request-section">
          <div class="request-header">
            <input 
              v-model="currentRequest.name" 
              class="request-name-input" 
              placeholder="Request Name"
            />
            <button @click="saveCurrentRequest" class="btn-sm">💾 Save</button>
          </div>

          <div class="request-url-bar">
            <select v-model="currentRequest.method" class="method-select">
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
              <option>HEAD</option>
              <option>OPTIONS</option>
            </select>
            <input 
              v-model="currentRequest.url" 
              type="text" 
              placeholder="Enter request URL" 
              class="url-input"
              @keyup.enter="sendRequest"
            />
            <button @click="sendRequest" :disabled="loading" class="send-btn">
              {{ loading ? 'Sending...' : 'Send' }}
            </button>
          </div>

          <!-- Request Tabs -->
          <div class="tabs">
            <button :class="{ active: activeTab === 'params' }" @click="activeTab = 'params'">
              Params
            </button>
            <button :class="{ active: activeTab === 'headers' }" @click="activeTab = 'headers'">
              Headers
            </button>
            <button :class="{ active: activeTab === 'body' }" @click="activeTab = 'body'">
              Body
            </button>
            <button :class="{ active: activeTab === 'auth' }" @click="activeTab = 'auth'">
              Auth
            </button>
          </div>

          <!-- Params Tab -->
          <div v-if="activeTab === 'params'" class="tab-content">
            <div class="kv-list">
              <div v-for="param in currentRequest.params" :key="param.id" class="kv-row">
                <input type="checkbox" v-model="param.enabled" />
                <input v-model="param.key" placeholder="Key" class="kv-input" />
                <input v-model="param.value" placeholder="Value" class="kv-input" />
                <button @click="removeParam(param.id)" class="btn-danger-sm">×</button>
              </div>
              <button @click="addParam" class="btn-sm">+ Add Param</button>
            </div>
          </div>

          <!-- Headers Tab -->
          <div v-if="activeTab === 'headers'" class="tab-content">
            <div class="kv-list">
              <div v-for="header in currentRequest.headers" :key="header.id" class="kv-row">
                <input type="checkbox" v-model="header.enabled" />
                <input v-model="header.key" placeholder="Key" class="kv-input" />
                <input v-model="header.value" placeholder="Value" class="kv-input" />
                <button @click="removeHeader(header.id)" class="btn-danger-sm">×</button>
              </div>
              <button @click="addHeader" class="btn-sm">+ Add Header</button>
            </div>
          </div>

          <!-- Body Tab -->
          <div v-if="activeTab === 'body'" class="tab-content">
            <div class="body-type-selector">
              <label>
                <input type="radio" :value="'none'" v-model="currentRequest.body.type" @change="setBodyType('none')" />
                None
              </label>
              <label>
                <input type="radio" :value="'json'" v-model="currentRequest.body.type" @change="setBodyType('json')" />
                JSON
              </label>
              <label>
                <input type="radio" :value="'raw'" v-model="currentRequest.body.type" @change="setBodyType('raw')" />
                Raw
              </label>
              <label>
                <input type="radio" :value="'xml'" v-model="currentRequest.body.type" @change="setBodyType('xml')" />
                XML
              </label>
            </div>
            <textarea 
              v-if="currentRequest.body.type !== 'none'"
              v-model="currentRequest.body.content" 
              class="body-textarea"
              placeholder='{"key": "value"}'
            ></textarea>
          </div>

          <!-- Auth Tab -->
          <div v-if="activeTab === 'auth'" class="tab-content">
            <div class="auth-type-selector">
              <select v-model="currentRequest.auth.type" @change="setAuthType(currentRequest.auth.type)">
                <option value="none">No Auth</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="apikey">API Key</option>
                <option value="oauth2">OAuth 2.0</option>
              </select>
            </div>

            <!-- Basic Auth -->
            <div v-if="currentRequest.auth.type === 'basic'" class="auth-fields">
              <input 
                v-model="currentRequest.auth.basic!.username" 
                placeholder="Username" 
                class="auth-input"
              />
              <input 
                v-model="currentRequest.auth.basic!.password" 
                type="password" 
                placeholder="Password" 
                class="auth-input"
              />
            </div>

            <!-- Bearer Token -->
            <div v-if="currentRequest.auth.type === 'bearer'" class="auth-fields">
              <input 
                v-model="currentRequest.auth.bearer!.token" 
                placeholder="Token" 
                class="auth-input"
              />
              <input 
                v-model="currentRequest.auth.bearer!.prefix" 
                placeholder="Prefix (default: Bearer)" 
                class="auth-input"
              />
            </div>

            <!-- API Key -->
            <div v-if="currentRequest.auth.type === 'apikey'" class="auth-fields">
              <input 
                v-model="currentRequest.auth.apikey!.key" 
                placeholder="Key" 
                class="auth-input"
              />
              <input 
                v-model="currentRequest.auth.apikey!.value" 
                placeholder="Value" 
                class="auth-input"
              />
              <select v-model="currentRequest.auth.apikey!.addTo" class="auth-select">
                <option value="header">Add to Header</option>
                <option value="query">Add to Query Params</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Response Section -->
        <div class="response-section">
          <h3>Response</h3>

          <div v-if="response" class="response-content">
            <div class="response-status">
              <span :class="['status-badge', statusClass]">
                {{ response.status }} {{ response.statusText }}
              </span>
              <span class="response-time">{{ response.duration }}ms</span>
              <span class="response-size">{{ (response.size / 1024).toFixed(2) }} KB</span>
            </div>

            <div class="response-tabs">
              <button :class="{ active: responseTab === 'body' }" @click="responseTab = 'body'">
                Body
              </button>
              <button :class="{ active: responseTab === 'headers' }" @click="responseTab = 'headers'">
                Headers
              </button>
              <button :class="{ active: responseTab === 'raw' }" @click="responseTab = 'raw'">
                Raw
              </button>
            </div>

            <div class="response-body">
              <div v-if="responseTab === 'body'">
                <button @click="copyToClipboard(formatJson(response.data))" class="btn-sm copy-btn">
                  📋 Copy
                </button>
                <pre>{{ formatJson(response.data) }}</pre>
              </div>
              <div v-if="responseTab === 'headers'">
                <pre>{{ formatJson(response.headers) }}</pre>
              </div>
              <div v-if="responseTab === 'raw'">
                <pre>{{ JSON.stringify(response, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div v-else-if="error" class="error-message">
            <h4>Error</h4>
            <pre>{{ error }}</pre>
          </div>

          <div v-else class="placeholder">
            <p>👈 Send a request to see the response here</p>
            <p class="placeholder-hint">Use {{'{'}}{'{'}variable{{'}'}}{{'}'}} syntax for environment variables</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Code Generation Modal -->
    <div v-if="showCodeGen" class="modal-overlay" @click="showCodeGen = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Code Generation</h3>
          <button @click="showCodeGen = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <select v-model="codeGenLanguage" class="code-lang-select">
            <option value="curl">cURL</option>
            <option value="javascript-fetch">JavaScript (Fetch)</option>
            <option value="javascript-axios">JavaScript (Axios)</option>
            <option value="python-requests">Python (Requests)</option>
            <option value="python-http">Python (http.client)</option>
            <option value="go-native">Go</option>
            <option value="node-axios">Node.js (Axios)</option>
          </select>
          <button @click="copyToClipboard(generatedCode)" class="btn-sm copy-btn">
            📋 Copy Code
          </button>
          <pre class="code-preview">{{ generatedCode }}</pre>
        </div>
      </div>
    </div>

    <!-- Import/Export Modal -->
    <div v-if="showImportExport" class="modal-overlay" @click="showImportExport = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Import / Export</h3>
          <button @click="showImportExport = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="import-export-section">
            <h4>Export</h4>
            <select v-model="exportFormat">
              <option value="collections">Collections</option>
              <option value="environments">Environments</option>
              <option value="history">History</option>
              <option value="all">All Data</option>
            </select>
            <button @click="exportData" class="btn">Download JSON</button>
          </div>
          <div class="import-export-section">
            <h4>Import</h4>
            <textarea 
              v-model="importData" 
              placeholder="Paste JSON data here..."
              class="import-textarea"
            ></textarea>
            <button @click="importDataFile" class="btn">Import</button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Collection Modal -->
    <div v-if="showNewCollection" class="modal-overlay" @click="showNewCollection = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>New Collection</h3>
          <button @click="showNewCollection = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <input 
            v-model="newCollectionName" 
            placeholder="Collection Name" 
            class="modal-input"
            @keyup.enter="createNewCollection"
          />
          <textarea 
            v-model="newCollectionDesc" 
            placeholder="Description (optional)" 
            class="modal-textarea"
          ></textarea>
          <button @click="createNewCollection" class="btn">Create</button>
        </div>
      </div>
    </div>

    <!-- New Environment Modal -->
    <div v-if="showNewEnvironment" class="modal-overlay" @click="showNewEnvironment = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>New Environment</h3>
          <button @click="showNewEnvironment = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <input 
            v-model="newEnvironmentName" 
            placeholder="Environment Name" 
            class="modal-input"
          />
          <h4>Add Initial Variable (optional)</h4>
          <input 
            v-model="newEnvVarKey" 
            placeholder="Variable Key" 
            class="modal-input"
          />
          <input 
            v-model="newEnvVarValue" 
            placeholder="Variable Value" 
            class="modal-input"
          />
          <button @click="createNewEnvironment" class="btn">Create</button>
        </div>
      </div>
    </div>

    <!-- Save Request Modal -->
    <div v-if="showSaveRequest" class="modal-overlay" @click="showSaveRequest = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Save Request to Collection</h3>
          <button @click="showSaveRequest = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="collection-select-list">
            <div 
              v-for="collection in collectionsStore.collections" 
              :key="collection.id"
              class="collection-select-item"
              @click="saveRequestToCollection(collection.id)"
            >
              📁 {{ collection.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <span>✅ No Telemetry</span>
      <span>✅ Bank Secure</span>
      <span>✅ Offline Ready</span>
      <span>{{ collectionsStore.totalRequests }} Requests</span>
      <span>{{ historyStore.history.length }} History Items</span>
    </footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #e0e0e0;
}

/* Header */
.header {
  background: #2d2d2d;
  padding: 0.75rem 1.5rem;
  border-bottom: 2px solid #3d3d3d;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #4CAF50;
}

.badge {
  background: #4CAF50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.header-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.env-select {
  padding: 0.5rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  min-width: 150px;
}

.icon-btn {
  padding: 0.5rem 0.75rem;
  background: #3d3d3d;
  color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.icon-btn:hover {
  background: #4d4d4d;
}

/* Main Container */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 300px;
  background: #2d2d2d;
  border-right: 2px solid #3d3d3d;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #3d3d3d;
}

.sidebar-tabs button {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  color: #888;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.75rem;
}

.sidebar-tabs button.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sidebar-header h3 {
  margin: 0;
  color: #4CAF50;
}

/* Collections */
.collections-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.collection-item {
  background: #1a1a1a;
  border-radius: 4px;
  padding: 0.5rem;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.collection-requests {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 1rem;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #2d2d2d;
  border-radius: 4px;
  cursor: pointer;
}

.request-item:hover {
  background: #3d3d3d;
}

.method-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
}

.method-badge.get { background: #4CAF50; color: white; }
.method-badge.post { background: #2196F3; color: white; }
.method-badge.put { background: #FF9800; color: white; }
.method-badge.patch { background: #9C27B0; color: white; }
.method-badge.delete { background: #f44336; color: white; }

.request-name {
  font-size: 0.85rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Environments */
.environments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.env-item {
  background: #1a1a1a;
  border-radius: 4px;
  padding: 0.5rem;
}

.env-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.env-vars {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 1rem;
}

.var-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem;
  font-size: 0.85rem;
}

.var-key {
  color: #4CAF50;
  font-weight: bold;
}

.var-value {
  color: #888;
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  background: #1a1a1a;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}

.history-item:hover {
  background: #2d2d2d;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.history-url {
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.history-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #888;
}

.status-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.status-badge.success {
  background: #4CAF50;
  color: white;
}

.status-badge.error {
  background: #f44336;
  color: white;
}

/* Content */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Request Section */
.request-section {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  border-bottom: 2px solid #3d3d3d;
}

.request-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.request-name-input {
  flex: 1;
  padding: 0.5rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-size: 1rem;
}

.request-url-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.method-select {
  padding: 0.75rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  min-width: 100px;
}

.url-input {
  flex: 1;
  padding: 0.75rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-size: 1rem;
}

.send-btn {
  padding: 0.75rem 2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.send-btn:hover:not(:disabled) {
  background: #45a049;
}

.send-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #3d3d3d;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #888;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tabs button.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}

.tab-content {
  min-height: 200px;
}

/* Key-Value List */
.kv-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kv-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.kv-input {
  flex: 1;
  padding: 0.5rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
}

/* Body */
.body-type-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.body-type-selector label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.body-textarea {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
}

/* Auth */
.auth-type-selector {
  margin-bottom: 1rem;
}

.auth-type-selector select {
  padding: 0.5rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  min-width: 200px;
}

.auth-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-input {
  padding: 0.5rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
}

.auth-select {
  padding: 0.5rem;
  background: #2d2d2d;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
}

/* Response Section */
.response-section {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.response-section h3 {
  margin-top: 0;
  color: #4CAF50;
  border-bottom: 2px solid #3d3d3d;
  padding-bottom: 0.5rem;
}

.response-status {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #2d2d2d;
  border-radius: 4px;
}

.status-badge.success { background: #4CAF50; color: white; padding: 0.5rem 1rem; border-radius: 4px; }
.status-badge.redirect { background: #2196F3; color: white; padding: 0.5rem 1rem; border-radius: 4px; }
.status-badge.client-error { background: #FF9800; color: white; padding: 0.5rem 1rem; border-radius: 4px; }
.status-badge.server-error { background: #f44336; color: white; padding: 0.5rem 1rem; border-radius: 4px; }

.response-time, .response-size {
  color: #888;
}

.response-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #3d3d3d;
}

.response-tabs button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #888;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.response-tabs button.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}

.response-body {
  position: relative;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
}

.response-body pre {
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  max-height: 500px;
  overflow-y: auto;
}

.placeholder {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.placeholder-hint {
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.5rem;
}

.error-message {
  color: #f44336;
  padding: 1rem;
  background: #2d2d2d;
  border-radius: 4px;
}

/* Buttons */
.btn-sm {
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-sm:hover {
  background: #45a049;
}

.btn-danger-sm {
  padding: 0.25rem 0.5rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-danger-sm:hover {
  background: #d32f2f;
}

.btn {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  background: #45a049;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2d2d2d;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #3d3d3d;
}

.modal-header h3 {
  margin: 0;
  color: #4CAF50;
}

.btn-close {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-input {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.modal-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: inherit;
  resize: vertical;
}

.import-textarea {
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.import-export-section {
  margin-bottom: 2rem;
}

.import-export-section h4 {
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.import-export-section select {
  width: 100%;
  padding: 0.5rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.code-lang-select {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.code-preview {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}

.collection-select-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.collection-select-item {
  padding: 1rem;
  background: #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
}

.collection-select-item:hover {
  background: #3d3d3d;
}

/* Footer */
.footer {
  background: #2d2d2d;
  padding: 0.75rem 1.5rem;
  border-top: 2px solid #3d3d3d;
  display: flex;
  gap: 2rem;
  font-size: 0.85rem;
  color: #888;
}
</style>
