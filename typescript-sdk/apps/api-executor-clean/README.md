# 🚀 API Executor

A clean, secure API testing tool built from scratch with Vue 3 + TypeScript + Vite. Designed for bank environments with **zero telemetry** and **no external dependencies** beyond essential packages.

## ✅ Features

- **Clean Build**: Built from scratch using `npm` only - no pnpm, no workspace protocol
- **No Telemetry**: Zero analytics, no data collection, completely offline-capable
- **HTTP Methods**: Support for GET, POST, PUT, PATCH, DELETE
- **Custom Headers**: Add/remove request headers dynamically
- **Request Body**: JSON body editor for POST/PUT/PATCH requests
- **Response Viewer**: Beautiful formatted response with status codes, headers, and body
- **Response Time**: Track request duration
- **Error Handling**: Clear error messages and status indicators
- **Dark Theme**: Professional dark UI suitable for long work sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
cd /Users/kargee/Downloads/api-executor-clean
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Dependencies

**Runtime:**
- `vue`: ^3.5.13 - Frontend framework
- `axios`: ^1.7.9 - HTTP client

**Development:**
- `vite`: ^7.1.12 - Build tool
- `@vitejs/plugin-vue`: ^6.0.1 - Vue plugin for Vite
- `typescript`: ^5.6.3 - Type safety
- `vue-tsc`: ^2.1.10 - Vue TypeScript compiler

**No telemetry, no analytics, no tracking.**

## 🧪 Testing the Application

### Test with Public API

The app comes pre-configured with a test URL:

```
GET https://jsonplaceholder.typicode.com/posts/1
```

Just click "Send" to test!

### Test POST Request

1. Change method to `POST`
2. Enter URL: `https://jsonplaceholder.typicode.com/posts`
3. Click "Body" tab
4. Enter JSON:
```json
{
  "title": "Test Post",
  "body": "This is a test",
  "userId": 1
}
```
5. Click "Send"

## 🔒 Security Features

- ✅ No telemetry or analytics
- ✅ No external CDN dependencies
- ✅ All code is local and auditable
- ✅ CORS-compliant
- ✅ No data persistence (requests are not stored)
- ✅ Bank-environment ready

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t api-executor:latest .
```

### Run Docker Container

```bash
docker run -p 3000:80 api-executor:latest
```

Access at http://localhost:3000

## 📁 Project Structure

```
api-executor-clean/
├── src/
│   ├── App.vue          # Main application component
│   ├── main.ts          # Application entry point
│   └── style.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md           # This file
```

## 🛠️ Technology Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Package Manager**: npm (no pnpm required)

## 📊 Status Codes

The app color-codes HTTP responses:

- 🟢 **2xx** (Success) - Green
- 🔵 **3xx** (Redirect) - Blue
- 🟠 **4xx** (Client Error) - Orange
- 🔴 **5xx** (Server Error) - Red

## 🤝 Contributing

This is a standalone application built for a secure bank environment. No external contributions are accepted.

## 📝 License

Proprietary - Internal Use Only

## ✅ Verification

**Server Running**: http://localhost:5173  
**Status**: ✅ Operational  
**Telemetry**: ❌ None  
**External Calls**: ❌ None (except user-initiated API requests)  

---

**Built with ❤️ for secure banking environments**
