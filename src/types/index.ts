// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'

// Protocol Types
export type ProtocolType = 'http' | 'websocket' | 'sse' | 'graphql' | 'grpc' | 'mqtt'

// Auth Types
export type AuthType = 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2' | 'digest' | 'hawk' | 'aws' | 'ntlm'

// Body Types
export type BodyType = 'none' | 'json' | 'xml' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary' | 'graphql'

// Request Parameter
export interface RequestParam {
  id: string
  key: string
  value: string
  description?: string
  enabled: boolean
}

// Request Header
export interface RequestHeader {
  id: string
  key: string
  value: string
  description?: string
  enabled: boolean
}

// Form Data Field
export interface FormDataField {
  id: string
  key: string
  value: string
  type: 'text' | 'file'
  enabled: boolean
}

// Authentication Config
export interface AuthConfig {
  type: AuthType
  basic?: {
    username: string
    password: string
  }
  bearer?: {
    token: string
    prefix?: string
  }
  apikey?: {
    key: string
    value: string
    addTo: 'header' | 'query'
  }
  oauth2?: {
    accessToken: string
    tokenType?: string
    addTo: 'header' | 'query'
    grantType?: 'authorization_code' | 'client_credentials' | 'password' | 'implicit'
  }
  digest?: {
    username: string
    password: string
  }
  hawk?: {
    authId: string
    authKey: string
    algorithm: string
  }
  aws?: {
    accessKey: string
    secretKey: string
    region: string
    service: string
  }
}

// Request Body
export interface RequestBody {
  type: BodyType
  content: string
  formData?: FormDataField[]
  graphql?: {
    query: string
    variables?: string
  }
}

// Pre-request Script
export interface PreRequestScript {
  enabled: boolean
  script: string
}

// Test Script
export interface TestScript {
  enabled: boolean
  script: string
}

// HTTP Request
export interface HttpRequest {
  id: string
  name: string
  method: HttpMethod
  url: string
  params: RequestParam[]
  headers: RequestHeader[]
  auth: AuthConfig
  body: RequestBody
  preRequestScript: PreRequestScript
  testScript: TestScript
  protocolType: ProtocolType
}

// WebSocket Request
export interface WebSocketRequest {
  id: string
  name: string
  url: string
  protocols?: string[]
  messages: Array<{
    id: string
    content: string
    timestamp: number
    direction: 'sent' | 'received'
  }>
}

// SSE Request
export interface SSERequest {
  id: string
  name: string
  url: string
  headers: RequestHeader[]
  events: Array<{
    id: string
    type: string
    data: string
    timestamp: number
  }>
}

// GraphQL Request
export interface GraphQLRequest {
  id: string
  name: string
  url: string
  query: string
  variables?: string
  headers: RequestHeader[]
  auth: AuthConfig
}

// Request (Union Type)
export type Request = HttpRequest | WebSocketRequest | SSERequest | GraphQLRequest

// Response
export interface HttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  size: number
  duration: number
  timestamp: number
}

// Test Result
export interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

// History Item
export interface HistoryItem {
  id: string
  request: HttpRequest
  response?: HttpResponse
  error?: string
  timestamp: number
}

// Collection Folder
export interface CollectionFolder {
  id: string
  name: string
  description?: string
  folders: CollectionFolder[]
  requests: Request[]
  expanded?: boolean
}

// Collection
export interface Collection {
  id: string
  name: string
  description?: string
  folders: CollectionFolder[]
  requests: Request[]
  variables?: EnvironmentVariable[]
  auth?: AuthConfig
  preRequestScript?: PreRequestScript
  testScript?: TestScript
  expanded?: boolean
  createdAt: number
  updatedAt: number
}

// Environment Variable
export interface EnvironmentVariable {
  id: string
  key: string
  value: string
  type: 'default' | 'secret'
  enabled: boolean
}

// Environment
export interface Environment {
  id: string
  name: string
  variables: EnvironmentVariable[]
  createdAt: number
  updatedAt: number
}

// Request Tab
export interface RequestTab {
  id: string
  name: string
  request: Request
  response?: HttpResponse
  error?: string
  testResults?: TestResult[]
  isDirty: boolean
  isSaved: boolean
}

// Code Generation Language
export type CodeGenLanguage = 
  | 'curl'
  | 'javascript-fetch'
  | 'javascript-axios'
  | 'python-requests'
  | 'python-http'
  | 'go-native'
  | 'java-okhttp'
  | 'java-unirest'
  | 'php-curl'
  | 'php-guzzle'
  | 'ruby-native'
  | 'csharp-restsharp'
  | 'csharp-httpclient'
  | 'swift-urlsession'
  | 'kotlin-okhttp'
  | 'rust-reqwest'
  | 'node-axios'
  | 'node-request'
  | 'powershell'

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: number
  followRedirects: boolean
  validateSSL: boolean
  timeout: number
  maxRedirects: number
  proxyEnabled: boolean
  proxyUrl?: string
  autoSave: boolean
  telemetryEnabled: boolean
}

// Import/Export Format
export type ImportExportFormat = 'hoppscotch' | 'postman' | 'insomnia' | 'openapi' | 'har'

// Export Data
export interface ExportData {
  version: string
  collections: Collection[]
  environments: Environment[]
  history: HistoryItem[]
  settings: AppSettings
  exportedAt: number
}

// Postman Collection (for import/export)
export interface PostmanCollection {
  info: {
    name: string
    description?: string
    schema: string
  }
  item: any[]
  variable?: any[]
  auth?: any
}

// Insomnia Workspace (for import/export)
export interface InsomniaWorkspace {
  _type: string
  resources: any[]
}

// OpenAPI Spec (for import)
export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, any>
  components?: any
}
