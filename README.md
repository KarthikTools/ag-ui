# 🚀 API Executor - Bank Secure Edition

A comprehensive, feature-rich API testing tool built from scratch with Vue 3, TypeScript, and Vite. Designed for secure banking environments with **zero telemetry** and complete offline capability.

## ✨ Features

### Core Features
- ✅ **Full HTTP Client** - Support for GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- ✅ **Collections Management** - Organize requests into collections with folders
- ✅ **Environments** - Variable management with {{variable}} interpolation
- ✅ **Request History** - Automatic tracking of all requests (last 100)
- ✅ **Multiple Auth Types** - Basic, Bearer Token, API Key, OAuth 2.0
- ✅ **Request Parameters** - Query params, headers, and body management
- ✅ **Body Types** - JSON, XML, Raw, Form Data support
- ✅ **Code Generation** - Generate code in 7+ languages
- ✅ **Import/Export** - JSON-based data portability
- ✅ **Local Storage** - All data persists locally in browser
- ✅ **Dark Theme** - Professional dark UI optimized for long sessions

### Code Generation Languages
- cURL
- JavaScript (Fetch)
- JavaScript (Axios)
- Python (Requests)
- Python (http.client)
- Go (native)
- Node.js (Axios)

### Security Features
- 🔒 **No Telemetry** - Zero data leaves your machine
- 🔒 **Offline Ready** - Works completely offline
- 🔒 **Local Storage Only** - All data stored in browser
- 🔒 **No External Dependencies** - No CDNs or external resources
- 🔒 **Bank Approved** - Designed for secure environments

## 🚀 Quick Start

### Prerequisites
- Node.js 20.14.0 or higher
- npm 10.7.0 or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Access
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage Guide

### 1. Making Your First Request

1. Enter a URL in the request bar (e.g., `https://jsonplaceholder.typicode.com/posts/1`)
2. Select HTTP method (GET, POST, etc.)
3. Click **Send**
4. View response in the bottom panel

### 2. Using Collections

1. Click **Collections** in the sidebar
2. Click **+ New** to create a collection
3. Name your collection
4. Save requests to collections using the **💾 Save** button

### 3. Environment Variables

1. Click **Environments** in the sidebar
2. Click **+ New** to create an environment
3. Add variables with key-value pairs
4. Select environment from header dropdown
5. Use `{{variableName}}` syntax in URLs, headers, or body

Example:
```
URL: {{baseUrl}}/api/users
Header: Authorization: {{apiToken}}
```

### 4. Authentication

Navigate to the **Auth** tab and select your auth type:

- **Basic Auth**: Username + Password
- **Bearer Token**: JWT or OAuth token
- **API Key**: Custom header or query param
- **OAuth 2.0**: Access token management

### 5. Request Parameters

- **Params Tab**: Add query parameters
- **Headers Tab**: Add custom headers
- **Body Tab**: Add request body (JSON, XML, Raw)

### 6. Code Generation

1. Configure your request
2. Click **{ }** button in header
3. Select language from dropdown
4. Click **📋 Copy Code**

### 7. Import/Export

1. Click **⇅** button in header
2. **Export**: Select data type and download JSON
3. **Import**: Paste JSON data and import

## 🏗️ Project Structure

```
api-executor-clean/
├── src/
│   ├── components/      # Vue components (future expansion)
│   ├── stores/          # Pinia state management
│   │   ├── collections.ts
│   │   ├── environments.ts
│   │   └── history.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── codegen.ts   # Code generation
│   │   ├── id.ts        # ID generation
│   │   ├── storage.ts   # Local storage
│   │   └── variables.ts # Variable interpolation
│   ├── App.vue          # Main application component
│   ├── main.ts          # Application entry point
│   └── style.css        # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔧 Technical Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Styling**: Scoped CSS
- **Storage**: LocalStorage API

## 📦 Dependencies

```json
{
  "vue": "^3.5.13",
  "pinia": "^2.3.1",
  "axios": "^1.7.9",
  "@vueuse/core": "^12.0.0"
}
```

## 🎨 Features in Detail

### Collections
- Create unlimited collections
- Organize requests hierarchically
- Duplicate requests
- Export/import collections
- Search within collections

### Environments
- Multiple environment support
- Variable interpolation with `{{var}}` syntax
- Secret variables (masked display)
- Environment switching
- Export/import environments

### History
- Automatic request tracking
- Last 100 requests saved
- Quick replay from history
- Search history
- Clear history option

### Request Builder
- Multiple HTTP methods
- Query parameter management
- Header management
- Body editor (JSON, XML, Raw)
- Authentication configuration
- Request naming and saving

### Response Viewer
- Formatted JSON display
- Response headers view
- Raw response view
- Status code highlighting
- Response time and size
- Copy response to clipboard

## 🔒 Security & Privacy

- **No Analytics**: Zero tracking or analytics
- **No Telemetry**: No data sent to external servers
- **Local Only**: All data stored in browser LocalStorage
- **No CDNs**: All assets bundled locally
- **CORS Aware**: Respects browser security policies
- **Secure by Default**: No insecure defaults

## 🚢 Deployment

### Docker (Coming Soon)
```bash
docker build -t api-executor .
docker run -p 8080:80 api-executor
```

### OpenShift (Coming Soon)
```bash
oc new-app api-executor
oc expose svc/api-executor
```

## 🧪 Testing

```bash
# Run unit tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e
```

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Full HTTP client with all methods
- ✅ Collections with folders
- ✅ Environments with variables
- ✅ Multiple authentication types
- ✅ Request history (100 items)
- ✅ Code generation (7 languages)
- ✅ Import/Export (JSON)
- ✅ Local storage persistence
- ✅ Dark theme UI

### Future Enhancements
- WebSocket client
- Server-Sent Events (SSE)
- GraphQL client
- Pre-request scripts
- Test scripts
- Postman/Insomnia import
- OpenAPI import
- Advanced code generation
- Team collaboration features

## 🤝 Contributing

This is a bank-internal tool. For feature requests or bug reports, contact the development team.

## 📄 License

Proprietary - Internal Use Only

## 🆘 Support

For support, contact your internal IT team or check the internal documentation portal.

---

**Built with ❤️ for secure banking environments**

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Production Ready
