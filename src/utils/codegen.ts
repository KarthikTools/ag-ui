import type { HttpRequest, CodeGenLanguage } from '../types'

export function generateCode(request: HttpRequest, language: CodeGenLanguage): string {
  switch (language) {
    case 'curl':
      return generateCurl(request)
    case 'javascript-fetch':
      return generateJavaScriptFetch(request)
    case 'javascript-axios':
      return generateJavaScriptAxios(request)
    case 'python-requests':
      return generatePythonRequests(request)
    case 'python-http':
      return generatePythonHttp(request)
    case 'go-native':
      return generateGo(request)
    case 'node-axios':
      return generateNodeAxios(request)
    default:
      return `// Code generation for ${language} not yet implemented`
  }
}

function generateCurl(request: HttpRequest): string {
  let code = `curl -X ${request.method} '${request.url}'`
  
  // Add headers
  const headers = request.headers.filter(h => h.enabled)
  for (const header of headers) {
    code += ` \\\n  -H '${header.key}: ${header.value}'`
  }
  
  // Add auth
  if (request.auth.type === 'basic' && request.auth.basic) {
    code += ` \\\n  -u '${request.auth.basic.username}:${request.auth.basic.password}'`
  } else if (request.auth.type === 'bearer' && request.auth.bearer) {
    code += ` \\\n  -H 'Authorization: Bearer ${request.auth.bearer.token}'`
  }
  
  // Add body
  if (request.body.type !== 'none' && request.body.content) {
    code += ` \\\n  -d '${request.body.content.replace(/'/g, "'\\''")}'`
  }
  
  return code
}

function generateJavaScriptFetch(request: HttpRequest): string {
  const headers = request.headers.filter(h => h.enabled)
  const hasBody = request.body.type !== 'none' && request.body.content
  
  let code = `fetch('${request.url}', {\n`
  code += `  method: '${request.method}',\n`
  
  if (headers.length > 0 || request.auth.type !== 'none') {
    code += `  headers: {\n`
    for (const header of headers) {
      code += `    '${header.key}': '${header.value}',\n`
    }
    if (request.auth.type === 'bearer' && request.auth.bearer) {
      code += `    'Authorization': 'Bearer ${request.auth.bearer.token}',\n`
    }
    code += `  },\n`
  }
  
  if (hasBody) {
    code += `  body: ${JSON.stringify(request.body.content)}\n`
  }
  
  code += `})\n`
  code += `  .then(response => response.json())\n`
  code += `  .then(data => console.log(data))\n`
  code += `  .catch(error => console.error('Error:', error));`
  
  return code
}

function generateJavaScriptAxios(request: HttpRequest): string {
  const headers = request.headers.filter(h => h.enabled)
  const hasBody = request.body.type !== 'none' && request.body.content
  
  let code = `axios({\n`
  code += `  method: '${request.method.toLowerCase()}',\n`
  code += `  url: '${request.url}',\n`
  
  if (headers.length > 0 || request.auth.type !== 'none') {
    code += `  headers: {\n`
    for (const header of headers) {
      code += `    '${header.key}': '${header.value}',\n`
    }
    if (request.auth.type === 'bearer' && request.auth.bearer) {
      code += `    'Authorization': 'Bearer ${request.auth.bearer.token}',\n`
    }
    code += `  },\n`
  }
  
  if (hasBody) {
    try {
      const parsed = JSON.parse(request.body.content)
      code += `  data: ${JSON.stringify(parsed, null, 2)}\n`
    } catch {
      code += `  data: ${JSON.stringify(request.body.content)}\n`
    }
  }
  
  code += `})\n`
  code += `  .then(response => console.log(response.data))\n`
  code += `  .catch(error => console.error('Error:', error));`
  
  return code
}

function generatePythonRequests(request: HttpRequest): string {
  const headers = request.headers.filter(h => h.enabled)
  const hasBody = request.body.type !== 'none' && request.body.content
  
  let code = `import requests\n\n`
  code += `url = '${request.url}'\n`
  
  if (headers.length > 0 || request.auth.type !== 'none') {
    code += `headers = {\n`
    for (const header of headers) {
      code += `    '${header.key}': '${header.value}',\n`
    }
    if (request.auth.type === 'bearer' && request.auth.bearer) {
      code += `    'Authorization': 'Bearer ${request.auth.bearer.token}',\n`
    }
    code += `}\n`
  }
  
  if (hasBody) {
    try {
      const parsed = JSON.parse(request.body.content)
      code += `data = ${JSON.stringify(parsed, null, 4).replace(/"/g, "'")}\n`
    } catch {
      code += `data = '${request.body.content}'\n`
    }
  }
  
  code += `\nresponse = requests.${request.method.toLowerCase()}(url`
  if (headers.length > 0) code += `, headers=headers`
  if (hasBody) code += `, json=data`
  code += `)\n`
  code += `print(response.json())`
  
  return code
}

function generatePythonHttp(request: HttpRequest): string {
  const headers = request.headers.filter(h => h.enabled)
  const hasBody = request.body.type !== 'none' && request.body.content
  
  let code = `import http.client\nimport json\nfrom urllib.parse import urlparse\n\n`
  code += `url = urlparse('${request.url}')\n`
  code += `conn = http.client.HTTPSConnection(url.netloc) if url.scheme == 'https' else http.client.HTTPConnection(url.netloc)\n\n`
  
  if (headers.length > 0) {
    code += `headers = {\n`
    for (const header of headers) {
      code += `    '${header.key}': '${header.value}',\n`
    }
    code += `}\n\n`
  }
  
  if (hasBody) {
    code += `payload = json.dumps(${request.body.content})\n\n`
  }
  
  code += `conn.request('${request.method}', url.path`
  if (hasBody) code += `, payload`
  if (headers.length > 0) code += `, headers`
  code += `)\n`
  code += `response = conn.getresponse()\n`
  code += `data = response.read()\n`
  code += `print(json.loads(data))`
  
  return code
}

function generateGo(request: HttpRequest): string {
  const headers = request.headers.filter(h => h.enabled)
  const hasBody = request.body.type !== 'none' && request.body.content
  
  let code = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n`
  if (hasBody) code += `\t"strings"`
  code += `)\n\nfunc main() {\n`
  
  code += `\turl := "${request.url}"\n`
  
  if (hasBody) {
    code += `\tpayload := strings.NewReader(\`${request.body.content}\`)\n`
    code += `\treq, _ := http.NewRequest("${request.method}", url, payload)\n`
  } else {
    code += `\treq, _ := http.NewRequest("${request.method}", url, nil)\n`
  }
  
  for (const header of headers) {
    code += `\treq.Header.Add("${header.key}", "${header.value}")\n`
  }
  
  if (request.auth.type === 'bearer' && request.auth.bearer) {
    code += `\treq.Header.Add("Authorization", "Bearer ${request.auth.bearer.token}")\n`
  }
  
  code += `\n\tres, _ := http.DefaultClient.Do(req)\n`
  code += `\tdefer res.Body.Close()\n`
  code += `\tbody, _ := io.ReadAll(res.Body)\n`
  code += `\tfmt.Println(string(body))\n`
  code += `}`
  
  return code
}

function generateNodeAxios(request: HttpRequest): string {
  return `const axios = require('axios');\n\n` + generateJavaScriptAxios(request)
}
