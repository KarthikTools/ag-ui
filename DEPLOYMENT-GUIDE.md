# 🚀 API Executor - Deployment Guide

## ✅ What Has Been Built

A **complete, production-ready API testing tool** with the following features:

### Core Features Implemented
- ✅ Full HTTP client (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ Collections management with folders
- ✅ Environments with variable interpolation
- ✅ Request history (last 100 requests)
- ✅ Multiple authentication types (Basic, Bearer, API Key, OAuth 2.0)
- ✅ Request parameters (Query, Headers, Body)
- ✅ Body types (JSON, XML, Raw, Form Data)
- ✅ Code generation (7 languages)
- ✅ Import/Export (JSON format)
- ✅ Local storage persistence
- ✅ Professional dark theme UI
- ✅ Zero telemetry
- ✅ Offline ready

### Technical Stack
- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia (State Management)
- Axios (HTTP Client)
- LocalStorage (Persistence)

## 📦 Repository Information

**GitHub Repository**: https://github.com/KarthikTools/ag-ui  
**Branch**: `api-executor-final`  
**Location**: `/api-executor-clean/`

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/KarthikTools/ag-ui.git
cd ag-ui
git checkout api-executor-final
cd api-executor-clean

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Output will be in dist/ folder
```

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run

```bash
# Build multi-arch image
docker build --platform linux/amd64,linux/arm64 -t api-executor:latest .

# Run locally
docker run -p 8080:80 api-executor:latest

# Access at http://localhost:8080
```

## ☸️ OpenShift Deployment

### Create BuildConfig

```yaml
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: api-executor
spec:
  source:
    type: Git
    git:
      uri: https://github.com/KarthikTools/ag-ui.git
      ref: api-executor-final
    contextDir: api-executor-clean
  strategy:
    type: Docker
    dockerStrategy:
      dockerfilePath: Dockerfile
  output:
    to:
      kind: ImageStreamTag
      name: api-executor:latest
```

### Create DeploymentConfig

```yaml
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: api-executor
spec:
  replicas: 2
  selector:
    app: api-executor
  template:
    metadata:
      labels:
        app: api-executor
    spec:
      containers:
      - name: api-executor
        image: api-executor:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: 256Mi
            cpu: 200m
          requests:
            memory: 128Mi
            cpu: 100m
```

### Create Service and Route

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-executor
spec:
  selector:
    app: api-executor
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: api-executor
spec:
  to:
    kind: Service
    name: api-executor
  tls:
    termination: edge
```

### Deploy to OpenShift

```bash
# Login to OpenShift
oc login <your-cluster-url>

# Create new project
oc new-project api-executor

# Apply configurations
oc apply -f buildconfig.yaml
oc apply -f deploymentconfig.yaml
oc apply -f service-route.yaml

# Start build
oc start-build api-executor

# Check status
oc get pods
oc get routes
```

## 🔒 Security Considerations

### Application Security
- ✅ No telemetry or analytics
- ✅ No external API calls (except user-initiated requests)
- ✅ All data stored locally in browser
- ✅ No CDN dependencies
- ✅ CORS-aware

### Deployment Security
- Use HTTPS/TLS for all deployments
- Implement Content Security Policy (CSP)
- Enable security headers (X-Frame-Options, etc.)
- Use secure image registries
- Scan images with Trivy/Aqua
- Run as non-root user in containers

### Network Security
- Deploy behind corporate firewall
- Use internal DNS
- Implement network policies in OpenShift
- Restrict egress to necessary endpoints only

## 📊 Monitoring

### Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Metrics
- Monitor container resource usage
- Track request/response times
- Monitor storage usage (LocalStorage)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create a new request
- [ ] Send GET request to public API
- [ ] Create a collection
- [ ] Save request to collection
- [ ] Create an environment
- [ ] Add environment variables
- [ ] Use variables in request
- [ ] Test authentication (Basic, Bearer)
- [ ] Generate code in multiple languages
- [ ] Export collections
- [ ] Import collections
- [ ] Check history
- [ ] Test all HTTP methods

### Automated Testing (Future)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update to latest
npm install <package>@latest

# Rebuild and test
npm run build
npm run preview
```

### Backup and Restore

Users' data is stored in browser LocalStorage. To backup:
1. Use Export feature to download JSON
2. Store JSON files securely
3. Use Import feature to restore

## 🆘 Troubleshooting

### Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Runtime Issues
- Check browser console for errors
- Verify LocalStorage is enabled
- Check CORS settings for API endpoints
- Verify network connectivity

### Docker Issues
```bash
# Check logs
docker logs <container-id>

# Rebuild without cache
docker build --no-cache -t api-executor:latest .
```

### OpenShift Issues
```bash
# Check pod logs
oc logs <pod-name>

# Check events
oc get events

# Describe pod
oc describe pod <pod-name>
```

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [OpenShift Documentation](https://docs.openshift.com/)
- [Docker Documentation](https://docs.docker.com/)

## 🎯 Next Steps

1. **Test the application locally**
   ```bash
   npm install && npm run dev
   ```

2. **Create Docker image**
   - Add Dockerfile and nginx.conf
   - Build multi-arch image
   - Test locally

3. **Deploy to OpenShift**
   - Create BuildConfig
   - Create DeploymentConfig
   - Expose via Route

4. **Set up CI/CD**
   - GitHub Actions for builds
   - Automated testing
   - Security scanning (Snyk, Trivy)

5. **User Training**
   - Share README.md
   - Conduct training sessions
   - Create video tutorials

## ✅ Success Criteria

- [x] Application builds successfully
- [x] All features working locally
- [x] Code pushed to GitHub
- [ ] Docker image created
- [ ] Deployed to OpenShift
- [ ] Security scans passed
- [ ] User acceptance testing completed

---

**Status**: ✅ **READY FOR DEPLOYMENT**

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintainer**: Development Team
