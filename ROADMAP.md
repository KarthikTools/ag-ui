# 🗺️ API Executor - Feature Roadmap

## Current vs Hoppscotch Feature Comparison

---

## ✅ **IMPLEMENTED FEATURES (v1.0)**

### Core HTTP Client
- ✅ All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ Query parameters management
- ✅ Headers management
- ✅ Request body (JSON, XML, Raw, Form Data)
- ✅ Response viewer (Body, Headers, Raw)
- ✅ Status code display
- ✅ Response time tracking
- ✅ Response size calculation

### Collections & Organization
- ✅ Collections management
- ✅ Folder structure support
- ✅ Save/load requests
- ✅ Duplicate requests
- ✅ Export/import collections (JSON)

### Environments
- ✅ Multiple environments
- ✅ Variable management
- ✅ `{{variable}}` interpolation
- ✅ Secret variables (masked)
- ✅ Environment switching
- ✅ Export/import environments

### Authentication
- ✅ No Auth
- ✅ Basic Auth
- ✅ Bearer Token
- ✅ API Key (Header/Query)
- ✅ OAuth 2.0 (Access Token)

### History & Persistence
- ✅ Request history (100 items)
- ✅ Local storage persistence
- ✅ History search
- ✅ Replay from history

### Code Generation
- ✅ cURL
- ✅ JavaScript (Fetch/Axios)
- ✅ Python (Requests/http.client)
- ✅ Go (native)
- ✅ Node.js (Axios)

### UI/UX
- ✅ Dark theme
- ✅ Sidebar navigation
- ✅ Tabbed interface
- ✅ Modal dialogs
- ✅ Responsive layout

---

## ❌ **MISSING FEATURES (vs Hoppscotch)**

### 1. **WebSocket Support** 🔴 HIGH PRIORITY
**What's Missing:**
- WebSocket connection management
- Send/receive messages
- Connection status tracking
- Message history
- Auto-reconnect

**How to Implement:**
```typescript
// Add to types/index.ts
export interface WebSocketConnection {
  id: string
  url: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  protocols?: string[]
  messages: Array<{
    id: string
    type: 'sent' | 'received'
    content: string
    timestamp: number
  }>
}

// Create stores/websocket.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWebSocketStore = defineStore('websocket', () => {
  const connections = ref<Map<string, WebSocket>>(new Map())
  const activeConnection = ref<string | null>(null)
  
  function connect(url: string, protocols?: string[]) {
    const ws = new WebSocket(url, protocols)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      // Update connection status
    }
    
    ws.onmessage = (event) => {
      // Handle incoming message
      // Add to message history
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }
    
    connections.value.set(url, ws)
  }
  
  function send(url: string, message: string) {
    const ws = connections.value.get(url)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  }
  
  function disconnect(url: string) {
    const ws = connections.value.get(url)
    if (ws) {
      ws.close()
      connections.value.delete(url)
    }
  }
  
  return { connect, send, disconnect }
})

// Add WebSocket UI component in App.vue
// Add protocol selector dropdown
// Add message input/output area
// Add connection status indicator
```

**Estimated Effort:** 2-3 days

---

### 2. **Server-Sent Events (SSE)** 🔴 HIGH PRIORITY
**What's Missing:**
- SSE connection management
- Event stream display
- Event filtering by type
- Connection status

**How to Implement:**
```typescript
// Add to stores/sse.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSSEStore = defineStore('sse', () => {
  const connections = ref<Map<string, EventSource>>(new Map())
  
  function connect(url: string, headers?: Record<string, string>) {
    const eventSource = new EventSource(url)
    
    eventSource.onopen = () => {
      console.log('SSE connected')
    }
    
    eventSource.onmessage = (event) => {
      console.log('Message:', event.data)
      // Store event in history
    }
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
    }
    
    // Listen for custom events
    eventSource.addEventListener('customEvent', (event) => {
      console.log('Custom event:', event.data)
    })
    
    connections.value.set(url, eventSource)
  }
  
  function disconnect(url: string) {
    const es = connections.value.get(url)
    if (es) {
      es.close()
      connections.value.delete(url)
    }
  }
  
  return { connect, disconnect }
})
```

**Estimated Effort:** 1-2 days

---

### 3. **GraphQL Client** 🟡 MEDIUM PRIORITY
**What's Missing:**
- GraphQL query editor
- Variables editor
- Schema introspection
- Query validation
- Autocomplete

**How to Implement:**
```typescript
// Add GraphQL request type
export interface GraphQLRequest {
  id: string
  name: string
  url: string
  query: string
  variables?: string
  headers: RequestHeader[]
  auth: AuthConfig
}

// Create GraphQL execution function
async function executeGraphQL(request: GraphQLRequest) {
  const response = await axios.post(request.url, {
    query: request.query,
    variables: request.variables ? JSON.parse(request.variables) : undefined
  }, {
    headers: processHeaders(request.headers)
  })
  
  return response.data
}

// Add GraphQL tab in UI
// Add query editor (textarea with syntax highlighting)
// Add variables editor (JSON)
// Add schema explorer (optional)
```

**Libraries to Consider:**
- `graphql` - GraphQL parser
- `graphql-tag` - Query parsing
- `@codemirror/lang-graphql` - Syntax highlighting

**Estimated Effort:** 3-4 days

---

### 4. **Pre-request Scripts** 🟡 MEDIUM PRIORITY
**What's Missing:**
- JavaScript execution before request
- Access to environment variables
- Ability to modify request
- Script editor

**How to Implement:**
```typescript
// Create script execution sandbox
function executePreRequestScript(script: string, context: any) {
  // Create safe execution context
  const sandbox = {
    env: context.environment,
    request: context.request,
    console: {
      log: (...args: any[]) => console.log('[Pre-request]', ...args)
    },
    // Utility functions
    setEnvVariable: (key: string, value: string) => {
      // Set environment variable
    },
    setHeader: (key: string, value: string) => {
      context.request.headers.push({ id: generateId(), key, value, enabled: true })
    }
  }
  
  // Execute script in sandbox
  try {
    const fn = new Function('context', `
      with (context) {
        ${script}
      }
    `)
    fn(sandbox)
  } catch (error) {
    console.error('Pre-request script error:', error)
    throw error
  }
}

// Usage in sendRequest()
if (currentRequest.value.preRequestScript.enabled) {
  try {
    executePreRequestScript(
      currentRequest.value.preRequestScript.script,
      {
        environment: environmentsStore.activeEnvironment,
        request: currentRequest.value
      }
    )
  } catch (error) {
    error.value = 'Pre-request script failed: ' + error.message
    return
  }
}
```

**Security Note:** Use a proper sandboxing library like `vm2` or `isolated-vm` for production.

**Estimated Effort:** 2-3 days

---

### 5. **Test Scripts** 🟡 MEDIUM PRIORITY
**What's Missing:**
- Post-response test execution
- Assertions (status, body, headers)
- Test results display
- Test report

**How to Implement:**
```typescript
// Add test execution
function executeTestScript(script: string, response: HttpResponse) {
  const tests: TestResult[] = []
  
  const sandbox = {
    response: response,
    expect: (value: any) => ({
      toBe: (expected: any) => {
        const passed = value === expected
        tests.push({
          name: 'Assertion',
          passed,
          error: passed ? undefined : `Expected ${expected}, got ${value}`,
          duration: 0
        })
      },
      toEqual: (expected: any) => {
        const passed = JSON.stringify(value) === JSON.stringify(expected)
        tests.push({
          name: 'Deep equality',
          passed,
          error: passed ? undefined : `Objects not equal`,
          duration: 0
        })
      }
    }),
    test: (name: string, fn: () => void) => {
      const start = Date.now()
      try {
        fn()
        tests.push({
          name,
          passed: true,
          duration: Date.now() - start
        })
      } catch (error) {
        tests.push({
          name,
          passed: false,
          error: error.message,
          duration: Date.now() - start
        })
      }
    }
  }
  
  try {
    const fn = new Function('context', `with (context) { ${script} }`)
    fn(sandbox)
  } catch (error) {
    console.error('Test script error:', error)
  }
  
  return tests
}

// Example test script:
/*
test('Status code is 200', () => {
  expect(response.status).toBe(200)
})

test('Response has data', () => {
  expect(response.data).toBeDefined()
})

test('User ID is correct', () => {
  expect(response.data.userId).toBe(1)
})
*/
```

**Estimated Effort:** 2-3 days

---

### 6. **Advanced Code Generation** 🟢 LOW PRIORITY
**What's Missing:**
- More languages (Ruby, Swift, Kotlin, Rust, PHP, C#, PowerShell)
- More libraries per language
- Code snippets for error handling
- Copy individual parts (headers only, body only)

**How to Implement:**
```typescript
// Extend utils/codegen.ts

function generateRuby(request: HttpRequest): string {
  let code = `require 'net/http'\nrequire 'json'\n\n`
  code += `uri = URI('${request.url}')\n`
  code += `http = Net::HTTP.new(uri.host, uri.port)\n`
  code += `http.use_ssl = true if uri.scheme == 'https'\n\n`
  code += `request = Net::HTTP::${request.method.capitalize}.new(uri.path)\n`
  
  // Add headers
  request.headers.filter(h => h.enabled).forEach(h => {
    code += `request['${h.key}'] = '${h.value}'\n`
  })
  
  // Add body
  if (request.body.content) {
    code += `request.body = ${JSON.stringify(request.body.content)}\n`
  }
  
  code += `\nresponse = http.request(request)\n`
  code += `puts JSON.parse(response.body)\n`
  
  return code
}

function generateSwift(request: HttpRequest): string {
  let code = `import Foundation\n\n`
  code += `let url = URL(string: "${request.url}")!\n`
  code += `var request = URLRequest(url: url)\n`
  code += `request.httpMethod = "${request.method}"\n\n`
  
  // Add headers
  request.headers.filter(h => h.enabled).forEach(h => {
    code += `request.setValue("${h.value}", forHTTPHeaderField: "${h.key}")\n`
  })
  
  // Add body
  if (request.body.content) {
    code += `\nlet body = """${request.body.content}"""\n`
    code += `request.httpBody = body.data(using: .utf8)\n`
  }
  
  code += `\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in\n`
  code += `    if let data = data {\n`
  code += `        print(String(data: data, encoding: .utf8)!)\n`
  code += `    }\n`
  code += `}\n`
  code += `task.resume()\n`
  
  return code
}

// Add more languages...
```

**Estimated Effort:** 1 day per language

---

### 7. **Postman/Insomnia Import** 🟡 MEDIUM PRIORITY
**What's Missing:**
- Parse Postman Collection v2.1
- Parse Insomnia workspace
- Convert to internal format
- Import dialog

**How to Implement:**
```typescript
// Create utils/importers.ts

interface PostmanCollection {
  info: { name: string; description?: string }
  item: PostmanItem[]
  variable?: PostmanVariable[]
}

interface PostmanItem {
  name: string
  request: {
    method: string
    url: string | { raw: string }
    header?: Array<{ key: string; value: string }>
    body?: { mode: string; raw?: string }
  }
  item?: PostmanItem[] // Nested folders
}

function convertPostmanToCollection(postman: PostmanCollection): Collection {
  const collection: Collection = {
    id: generateId(),
    name: postman.info.name,
    description: postman.info.description,
    folders: [],
    requests: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  function processItem(item: PostmanItem): HttpRequest | CollectionFolder {
    if (item.item) {
      // It's a folder
      return {
        id: generateId(),
        name: item.name,
        folders: [],
        requests: item.item.map(i => processItem(i) as HttpRequest),
        expanded: true
      }
    } else {
      // It's a request
      return {
        id: generateId(),
        name: item.name,
        method: item.request.method as HttpMethod,
        url: typeof item.request.url === 'string' 
          ? item.request.url 
          : item.request.url.raw,
        params: [],
        headers: (item.request.header || []).map(h => ({
          id: generateId(),
          key: h.key,
          value: h.value,
          enabled: true
        })),
        auth: { type: 'none' },
        body: {
          type: item.request.body?.mode as BodyType || 'none',
          content: item.request.body?.raw || ''
        },
        preRequestScript: { enabled: false, script: '' },
        testScript: { enabled: false, script: '' },
        protocolType: 'http'
      }
    }
  }
  
  postman.item.forEach(item => {
    const processed = processItem(item)
    if ('requests' in processed) {
      collection.folders.push(processed)
    } else {
      collection.requests.push(processed)
    }
  })
  
  return collection
}

// Similar function for Insomnia
function convertInsomniaToCollection(insomnia: InsomniaWorkspace): Collection {
  // Parse Insomnia format
  // Convert to internal format
}
```

**Estimated Effort:** 2-3 days

---

### 8. **OpenAPI/Swagger Import** 🟡 MEDIUM PRIORITY
**What's Missing:**
- Parse OpenAPI 3.0 spec
- Generate requests from paths
- Import schemas
- Generate examples

**How to Implement:**
```typescript
// Create utils/openapi-importer.ts

function importOpenAPISpec(spec: OpenAPISpec): Collection {
  const collection: Collection = {
    id: generateId(),
    name: spec.info.title,
    description: spec.info.description,
    folders: [],
    requests: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  // Get base URL
  const baseUrl = spec.servers?.[0]?.url || ''
  
  // Process each path
  Object.entries(spec.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const request: HttpRequest = {
          id: generateId(),
          name: operation.summary || `${method.toUpperCase()} ${path}`,
          method: method.toUpperCase() as HttpMethod,
          url: baseUrl + path,
          params: [],
          headers: [],
          auth: { type: 'none' },
          body: { type: 'none', content: '' },
          preRequestScript: { enabled: false, script: '' },
          testScript: { enabled: false, script: '' },
          protocolType: 'http'
        }
        
        // Add parameters
        if (operation.parameters) {
          operation.parameters.forEach(param => {
            if (param.in === 'query') {
              request.params.push({
                id: generateId(),
                key: param.name,
                value: param.example || '',
                description: param.description,
                enabled: true
              })
            } else if (param.in === 'header') {
              request.headers.push({
                id: generateId(),
                key: param.name,
                value: param.example || '',
                description: param.description,
                enabled: true
              })
            }
          })
        }
        
        // Add request body
        if (operation.requestBody) {
          const content = operation.requestBody.content
          if (content['application/json']) {
            request.body.type = 'json'
            request.body.content = JSON.stringify(
              content['application/json'].example || {},
              null,
              2
            )
          }
        }
        
        collection.requests.push(request)
      }
    })
  })
  
  return collection
}
```

**Estimated Effort:** 2-3 days

---

### 9. **Request Chaining** 🟢 LOW PRIORITY
**What's Missing:**
- Extract values from response
- Use in next request
- Variable extraction syntax
- Chain visualization

**How to Implement:**
```typescript
// Add response variable extraction
function extractFromResponse(response: HttpResponse, path: string): any {
  // Use JSONPath or similar
  // Example: $.data.token
  const parts = path.split('.')
  let value = response.data
  
  for (const part of parts) {
    if (part === '$') continue
    value = value[part]
  }
  
  return value
}

// Store extracted values
const responseVariables = ref<Record<string, any>>({})

// After successful request:
if (currentRequest.value.responseExtractors) {
  currentRequest.value.responseExtractors.forEach(extractor => {
    const value = extractFromResponse(response.value!, extractor.path)
    responseVariables.value[extractor.name] = value
  })
}

// Use in variable interpolation
function interpolateVariables(text: string, environment?: Environment): string {
  // Existing environment variable interpolation
  // + Response variable interpolation
  
  // Replace {{$response.variableName}}
  text = text.replace(/\{\{\$response\.([^}]+)\}\}/g, (match, varName) => {
    return responseVariables.value[varName] || match
  })
  
  return text
}
```

**Estimated Effort:** 2-3 days

---

### 10. **Bulk Operations** 🟢 LOW PRIORITY
**What's Missing:**
- Run multiple requests
- Collection runner
- Iteration with data
- Results summary

**How to Implement:**
```typescript
// Create collection runner
async function runCollection(collectionId: string, iterations: number = 1) {
  const collection = collectionsStore.collections.find(c => c.id === collectionId)
  if (!collection) return
  
  const results: Array<{
    request: HttpRequest
    response?: HttpResponse
    error?: string
    iteration: number
  }> = []
  
  for (let i = 0; i < iterations; i++) {
    for (const request of collection.requests) {
      try {
        const response = await executeRequest(request)
        results.push({ request, response, iteration: i + 1 })
      } catch (error) {
        results.push({ request, error: error.message, iteration: i + 1 })
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

// Add UI for collection runner
// Show progress
// Display results table
```

**Estimated Effort:** 2-3 days

---

### 11. **Request Documentation** 🟢 LOW PRIORITY
**What's Missing:**
- Markdown description per request
- Parameter documentation
- Response examples
- Documentation viewer

**How to Implement:**
```typescript
// Add to HttpRequest type
export interface HttpRequest {
  // ... existing fields
  documentation?: {
    description: string // Markdown
    examples?: Array<{
      name: string
      request: Partial<HttpRequest>
      response: any
    }>
  }
}

// Add documentation tab in UI
// Use markdown renderer (e.g., marked.js)
// Add example selector
```

**Estimated Effort:** 1-2 days

---

### 12. **Proxy Support** 🟢 LOW PRIORITY
**What's Missing:**
- Proxy configuration
- Proxy authentication
- Proxy toggle
- System proxy detection

**How to Implement:**
```typescript
// Add proxy settings
export interface ProxyConfig {
  enabled: boolean
  host: string
  port: number
  protocol: 'http' | 'https' | 'socks4' | 'socks5'
  auth?: {
    username: string
    password: string
  }
}

// Configure axios with proxy
const config: any = {
  method: currentRequest.value.method,
  url: processedUrl.value,
  headers,
  proxy: settings.proxyEnabled ? {
    host: settings.proxyHost,
    port: settings.proxyPort,
    auth: settings.proxyAuth
  } : false
}
```

**Note:** Browser-based apps have limitations with proxies due to CORS and security policies.

**Estimated Effort:** 1 day

---

### 13. **Team Collaboration** 🔵 FUTURE
**What's Missing:**
- Cloud sync
- Team workspaces
- Sharing collections
- Real-time collaboration
- Comments

**How to Implement:**
Requires backend infrastructure:
- Authentication service
- Database (PostgreSQL/MongoDB)
- Real-time sync (WebSockets)
- API endpoints
- Access control

**Estimated Effort:** 4-6 weeks (full backend + frontend)

---

### 14. **Advanced Features** 🔵 FUTURE
**What's Missing:**
- Mock servers
- API monitoring
- Performance testing
- Load testing
- API documentation generation
- CI/CD integration

**Estimated Effort:** Varies (1-4 weeks per feature)

---

## 📊 **Priority Matrix**

### Phase 1 (Next 2 weeks) - Essential Protocols
1. ✅ WebSocket Support (3 days)
2. ✅ SSE Support (2 days)
3. ✅ GraphQL Client (4 days)

### Phase 2 (Weeks 3-4) - Scripting & Testing
4. ✅ Pre-request Scripts (3 days)
5. ✅ Test Scripts (3 days)
6. ✅ Postman Import (3 days)

### Phase 3 (Month 2) - Enhanced Features
7. ✅ OpenAPI Import (3 days)
8. ✅ Request Chaining (3 days)
9. ✅ Advanced Code Generation (5 days)
10. ✅ Bulk Operations (3 days)

### Phase 4 (Month 3+) - Nice to Have
11. ✅ Request Documentation (2 days)
12. ✅ Proxy Support (1 day)
13. 🔵 Team Collaboration (6 weeks)
14. 🔵 Advanced Features (ongoing)

---

## 🛠️ **Implementation Tips**

### 1. **Use Existing Libraries**
- `graphql` - GraphQL support
- `ws` - WebSocket (Node.js)
- `marked` - Markdown rendering
- `monaco-editor` - Advanced code editor
- `jsonpath-plus` - JSON path queries
- `vm2` - Safe script execution

### 2. **Security Considerations**
- Sanitize all user inputs
- Use CSP headers
- Sandbox script execution
- Validate imported data
- Rate limit requests

### 3. **Performance**
- Lazy load components
- Virtual scrolling for large lists
- Debounce search inputs
- Cache responses
- Optimize bundle size

### 4. **Testing**
- Unit tests for utilities
- Integration tests for stores
- E2E tests for critical flows
- Manual testing checklist

---

## 📝 **Development Workflow**

1. **Pick a feature** from Phase 1
2. **Create feature branch**: `git checkout -b feature/websocket-support`
3. **Implement** following the guides above
4. **Test thoroughly**
5. **Update documentation**
6. **Create PR** and review
7. **Merge** to main branch
8. **Deploy** and monitor

---

## 🎯 **Success Metrics**

- ✅ Feature parity with Hoppscotch: 60% (current)
- 🎯 Target for v2.0: 85%
- 🎯 Target for v3.0: 95%

---

## 📚 **Resources**

- [Hoppscotch GitHub](https://github.com/hoppscotch/hoppscotch)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [GraphQL Spec](https://graphql.org/learn/)
- [OpenAPI Spec](https://swagger.io/specification/)
- [Postman Collection Format](https://schema.postman.com/)

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0  
**Maintainer:** Development Team
