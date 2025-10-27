<script setup lang="ts">
import { ref, computed } from 'vue'
import axios, { type AxiosResponse, type AxiosError } from 'axios'

const method = ref('GET')
const url = ref('https://jsonplaceholder.typicode.com/posts/1')
const headers = ref([{ key: 'Content-Type', value: 'application/json' }])
const body = ref('')
const activeTab = ref('headers')
const loading = ref(false)
const response = ref<AxiosResponse | null>(null)
const error = ref<string | null>(null)
const responseTime = ref(0)

const statusClass = computed(() => {
  if (!response.value) return ''
  const status = response.value.status
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'redirect'
  if (status >= 400 && status < 500) return 'client-error'
  return 'server-error'
})

function addHeader() {
  headers.value.push({ key: '', value: '' })
}

function removeHeader(index: number) {
  headers.value.splice(index, 1)
}

function formatHeaders(headers: any): string {
  return JSON.stringify(headers, null, 2)
}

function formatBody(data: any): string {
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

async function sendRequest() {
  loading.value = true
  response.value = null
  error.value = null
  
  const startTime = Date.now()
  
  try {
    const requestHeaders: Record<string, string> = {}
    headers.value.forEach(h => {
      if (h.key && h.value) {
        requestHeaders[h.key] = h.value
      }
    })

    const config: any = {
      method: method.value,
      url: url.value,
      headers: requestHeaders,
    }

    if (['POST', 'PUT', 'PATCH'].includes(method.value) && body.value) {
      try {
        config.data = JSON.parse(body.value)
      } catch {
        config.data = body.value
      }
    }

    const res = await axios(config)
    response.value = res
    responseTime.value = Date.now() - startTime
  } catch (err: any) {
    responseTime.value = Date.now() - startTime
    if (err.response) {
      response.value = err.response
    } else {
      error.value = err.message || 'Request failed'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="api-executor">
    <header>
      <h1>🚀 API Executor</h1>
      <p>Secure API Testing Tool - Bank Environment</p>
    </header>

    <main>
      <div class="request-panel">
        <h2>Request</h2>
        
        <div class="method-url">
          <select v-model="method" class="method-select">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
          
          <input 
            v-model="url" 
            type="text" 
            placeholder="Enter API URL (e.g., https://jsonplaceholder.typicode.com/posts/1)"
            class="url-input"
          />
          
          <button @click="sendRequest" :disabled="loading" class="send-button">
            {{ loading ? 'Sending...' : 'Send' }}
          </button>
        </div>

        <div class="tabs">
          <button 
            :class="{ active: activeTab === 'headers' }" 
            @click="activeTab = 'headers'"
          >
            Headers
          </button>
          <button 
            :class="{ active: activeTab === 'body' }" 
            @click="activeTab = 'body'"
          >
            Body
          </button>
        </div>

        <div v-if="activeTab === 'headers'" class="headers-section">
          <div v-for="(header, index) in headers" :key="index" class="header-row">
            <input 
              v-model="header.key" 
              placeholder="Header name"
              class="header-input"
            />
            <input 
              v-model="header.value" 
              placeholder="Header value"
              class="header-input"
            />
            <button @click="removeHeader(index)" class="remove-button">×</button>
          </div>
          <button @click="addHeader" class="add-button">+ Add Header</button>
        </div>

        <div v-if="activeTab === 'body'" class="body-section">
          <textarea 
            v-model="body" 
            placeholder='{"key": "value"}'
            class="body-textarea"
          ></textarea>
        </div>
      </div>

      <div class="response-panel">
        <h2>Response</h2>
        
        <div v-if="response" class="response-info">
          <div class="status-line">
            <span :class="['status', statusClass]">{{ response.status }} {{ response.statusText }}</span>
            <span class="time">{{ responseTime }}ms</span>
          </div>
          
          <div class="response-headers">
            <h3>Headers</h3>
            <pre>{{ formatHeaders(response.headers) }}</pre>
          </div>
          
          <div class="response-body">
            <h3>Body</h3>
            <pre>{{ formatBody(response.data) }}</pre>
          </div>
        </div>

        <div v-else-if="error" class="error-message">
          <h3>Error</h3>
          <pre>{{ error }}</pre>
        </div>

        <div v-else class="placeholder">
          Send a request to see the response here
        </div>
      </div>
    </main>

    <footer>
      <p>✅ No telemetry | ✅ Secure | ✅ Bank-approved</p>
    </footer>
  </div>
</template>

<style scoped>
.api-executor {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #e0e0e0;
}

header {
  background: #2d2d2d;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #3d3d3d;
}

header h1 {
  margin: 0;
  font-size: 2rem;
  color: #4CAF50;
}

header p {
  margin: 0.5rem 0 0 0;
  color: #888;
}

main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.request-panel, .response-panel {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 1.5rem;
  overflow: auto;
}

h2 {
  margin-top: 0;
  color: #4CAF50;
  border-bottom: 2px solid #3d3d3d;
  padding-bottom: 0.5rem;
}

.method-url {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.method-select {
  padding: 0.75rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.url-input {
  flex: 1;
  padding: 0.75rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-size: 1rem;
}

.send-button {
  padding: 0.75rem 2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.send-button:hover:not(:disabled) {
  background: #45a049;
}

.send-button:disabled {
  background: #666;
  cursor: not-allowed;
}

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
  transition: all 0.3s;
}

.tabs button.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}

.header-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.header-input {
  flex: 1;
  padding: 0.5rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
}

.remove-button {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button {
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.body-textarea {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
}

.status-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #1a1a1a;
  border-radius: 4px;
}

.status {
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.status.success {
  background: #4CAF50;
  color: white;
}

.status.redirect {
  background: #2196F3;
  color: white;
}

.status.client-error {
  background: #FF9800;
  color: white;
}

.status.server-error {
  background: #f44336;
  color: white;
}

.time {
  color: #888;
}

.response-headers, .response-body {
  margin-bottom: 1rem;
}

h3 {
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

pre {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
}

.placeholder {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error-message {
  color: #f44336;
}

footer {
  background: #2d2d2d;
  padding: 1rem 2rem;
  text-align: center;
  border-top: 2px solid #3d3d3d;
  color: #888;
}

footer p {
  margin: 0;
}
</style>
