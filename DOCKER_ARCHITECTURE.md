# Docker Deployment Architecture Guide for LOC8

## Overview

This document describes the Docker deployment architecture for the LOC8 project, including development and production setups.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                     │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                    NGINX (Reverse Proxy)              │    │
│  │              Port 80/443, Load Balancer              │    │
│  └──────────────────────────────────────────────────────┘    │
│                   ↓                      ↓                     │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │  Frontend (Nginx)     │  │  Backend (Gunicorn)  │          │
│  │  Port 3000           │  │  Port 8000           │          │
│  │  React + Vite Build  │  │  FastAPI + Workers   │          │
│  │  Static Assets       │  │  4 Worker Processes  │          │
│  │  Gzip Compression    │  │  Gevent Worker Class │          │
│  └──────────────────────┘  └──────────────────────┘          │
│           ↓                          ↓                        │
│       HTML/CSS/JS              API Endpoints                  │
│       Static Files           Growth Prediction               │
│                              Analytics Routes                │
│                                                                │
│  Optional: PostgreSQL Database (separate container)          │
│  Optional: Redis Cache (separate container)                  │
│                                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Development Environment                      │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              NGINX (Traffic Router)                   │    │
│  │              Port 80, Optional                       │    │
│  └──────────────────────────────────────────────────────┘    │
│                   ↓                      ↓                     │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │  Frontend (Dev Server)│  │  Backend (Uvicorn)   │          │
│  │  Port 3000           │  │  Port 8000           │          │
│  │  Hot Module Reload   │  │  Auto Reload         │          │
│  │  Source Mounted      │  │  Source Mounted      │          │
│  │  Full Stack Maps     │  │  Full Stack Maps     │          │
│  └──────────────────────┘  └──────────────────────┘          │
│           ↓                          ↓                        │
│      File Changes          File Changes                       │
│      Auto Refresh          Auto Restart                       │
│                                                                │
│  Volume Mounts: ./Backend → /app, ./Frontend → /app          │
│  Services Stay Alive During Development                      │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

## Container Specifications

### Backend Container

**Development (Dockerfile):**
```
- Base Image: python:3.11-slim
- Command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
- Volume Mount: ./Backend:/app (auto-reload on changes)
- Port: 8000
- Environment: PYTHONUNBUFFERED=1
- Health Check: /docs endpoint
```

**Production (Dockerfile.backend.prod):**
```
- Base Image: python:3.11-slim
- Command: gunicorn --bind 0.0.0.0:8000 --workers 4 --worker-class gevent
- User: appuser (non-root for security)
- Port: 8000
- Environment: DEBUG=false, Optimized logging
- Health Check: /docs endpoint
- Resource Limits: 1 CPU, 512MB RAM
```

### Frontend Container

**Development (Dockerfile):**
```
- Base Image: node:20-alpine
- Command: serve -s dist -l 3000
- Volume Mount: ./Frontend:/app (Vite HMR)
- Port: 3000
- Environment: VITE_API_BASE_URL=http://localhost:8000/api
- Health Check: / endpoint
```

**Production (Dockerfile.frontend.prod):**
```
- Multi-stage Build:
  - Stage 1: node:20-alpine (build)
    - npm ci / npm install
    - npm run build → dist/
  - Stage 2: nginx:alpine (runtime)
    - Serve dist/ via Nginx
    - Gzip compression enabled
    - Static caching optimized
- Config: nginx.conf (rate limiting, routing)
- Port: 80
- Resource Limits: 1 CPU, 512MB RAM
```

### Nginx Container

**Purpose:**
- Reverse proxy for all traffic
- Load balancing (if scaled horizontally)
- Static asset serving
- CORS header management
- Rate limiting
- HTTPS termination (production)

**Routes:**
```
/ → Frontend (3000)
/api/* → Backend (8000)
/docs → Backend API docs
/health → Health check endpoint
```

## Network Architecture

### Network: `loc8-network` (Bridge)

**Service DNS Resolution:**
- `backend` → Backend API container
- `frontend` → Frontend container
- `nginx` → Nginx reverse proxy

**Communication Flow:**
```
Client Browser
    ↓
Nginx (loc8-network:80/443)
    ↓
    ├→ Frontend (loc8-network:3000)
    └→ Backend (loc8-network:8000)
```

**Internal Service Communication:**
- Frontend can call Backend via `http://backend:8000/api` (inside container)
- Backend can call other services if needed
- All containers can resolve each other by service name

## Volume Management

### Development Volumes

```yaml
Backend:
  - ./Backend:/app  # Source code with auto-reload

Frontend:
  - ./Frontend:/app # Source code with Vite HMR
```

### Production Volumes (Optional)

```yaml
backend_data:
  - For persistent backend data (logs, cache)
  
frontend_data:
  - For frontend assets
  
ssl:
  - ./ssl:/etc/nginx/ssl:ro (SSL certificates)
```

## Environment Configuration

### Development (.env.docker)
- `DEBUG=true` (if needed for development)
- `VITE_API_BASE_URL=http://localhost:8000/api`
- Permissive CORS for local development
- Direct port access to services

### Production (.env.prod)
- `DEBUG=false`
- `VITE_API_BASE_URL=/api` (relative, goes through Nginx)
- Restricted CORS (only your domain)
- All traffic via Nginx on ports 80/443
- Strong SECRET_KEY and security headers

## Performance Optimizations

### Build Optimization
- Multi-stage builds: Frontend doesn't include build tools
- Layer caching: Dependencies installed before source code
- `.dockerignore`: Excludes unnecessary files
- Minimal base images: `alpine` variants where possible

### Runtime Optimization
- Gunicorn workers: 4 workers, gevent for async
- Nginx caching: Static assets with long expiration
- Gzip compression: Enabled for all responses
- Resource limits: Prevents runaway containers

### Health Checks
- Backend: Checks `/docs` endpoint (simple HTTP request)
- Frontend: Checks root endpoint
- Nginx: Implicit (part of routing)
- Restart policy: `unless-stopped` (auto-restart on failure)

## Security Features

### Container Security
- **Non-root user**: Backend runs as `appuser` (uid 1000)
- **Read-only mounts**: Config files are read-only (`:ro`)
- **Minimal base images**: Reduced attack surface
- **No secrets in container**: Secrets passed via env vars
- **Health checks**: Auto-restart failed services

### Network Security
- **Internal network**: Containers don't expose ports to host by default
- **Nginx firewall**: Single entry point with rate limiting
- **CORS headers**: Controlled access from frontend
- **HTTPS support**: SSL/TLS termination at Nginx

### Environment Security
- **Separate env files**: .env.docker vs .env.prod
- **Never commit secrets**: .env files in .gitignore
- **Example templates**: .env.docker and .env.prod.example provided
- **Secret rotation**: Easy rotation via env file updates

## Scaling Considerations

### Horizontal Scaling (Multiple Instances)

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Nginx automatically load-balances across instances
```

**Requirements:**
- Stateless backend (no local session storage)
- Shared session storage if needed (Redis)
- Nginx configured for load balancing (✓ already done)

### Vertical Scaling (More Resources)

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
    reservations:
      cpus: '1'
      memory: 512M
```

### Database Scaling

For larger deployments, add PostgreSQL:

```yaml
postgres:
  image: postgres:15-alpine
  volumes:
    - postgres_data:/var/lib/postgresql/data
  environment:
    POSTGRES_PASSWORD: secure_password
```

Connect via `DATABASE_URL=postgresql://user:pass@postgres:5432/db`

## CI/CD Integration

### Deployment Pipeline

```
1. Code Push to Repository
   ↓
2. GitHub Actions / GitLab CI
   ├→ Run Tests
   ├→ Build Images
   ├→ Push to Registry (Docker Hub / ECR)
   ↓
3. Production Server
   ├→ Pull Images
   ├→ Run docker-compose.prod.yml
   ├→ Health Checks
   ↓
4. Monitoring & Alerts
   ├→ Logs Collection
   ├→ Error Tracking
   ├→ Performance Metrics
```

### Docker Registry Options

- **Docker Hub**: `docker.io/username/loc8-backend`
- **AWS ECR**: `123456789.dkr.ecr.region.amazonaws.com/loc8-backend`
- **Google Container Registry**: `gcr.io/project-id/loc8-backend`
- **GitHub Container Registry**: `ghcr.io/username/loc8-backend`

## Monitoring & Logging

### Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Health Monitoring

```bash
# Check service status
docker-compose ps

# Inspect specific container
docker-compose exec backend bash
```

### Log Aggregation (Production)

For production, consider:
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Splunk**: Enterprise logging platform
- **CloudWatch**: AWS native logging
- **Datadog**: APM and monitoring
- **Sentry**: Error tracking

## Disaster Recovery

### Backup Strategy

```bash
# Backup volumes
docker run --rm -v loc8_backend_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backend_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v loc8_backend_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/backend_backup.tar.gz -C /data
```

### Database Backups

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U user dbname > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U user dbname < backup.sql
```

## Troubleshooting Common Issues

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend

# Run with interactive terminal
docker-compose run --rm backend bash
```

### Port Conflicts
```bash
# Find process using port
lsof -i :8000

# Change port in docker-compose.yml
ports:
  - "8001:8000"
```

### Network Issues
```bash
# Test connectivity between containers
docker-compose exec frontend ping backend

# Inspect network
docker network inspect loc8-network

# Check DNS resolution
docker-compose exec frontend nslookup backend
```

### Memory Issues
```bash
# Check resource usage
docker stats

# View limits
docker inspect backend | grep -A 5 MemoryLimit

# Update limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

## Cloud Deployment Options

### AWS (ECS Fargate)
- No server management
- Auto-scaling capabilities
- Load balancing included
- Uses ECR for image storage

### Google Cloud (Cloud Run)
- Serverless containers
- Auto-scales to zero
- Pay per request
- Requires stateless apps

### Azure (Container Instances)
- Quick container deployment
- Virtual networking support
- Good for scheduled tasks

### DigitalOcean (App Platform)
- Managed container platform
- Built-in GitHub integration
- Simpler alternative to Kubernetes

### Kubernetes (K8s)
- Container orchestration platform
- Auto-scaling and healing
- Service discovery
- Deployment: `kompose convert -f docker-compose.prod.yml`

## References

- Docker Compose: https://docs.docker.com/compose/
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/docker/
- Nginx Configuration: https://nginx.org/en/docs/
- Docker Security: https://docs.docker.com/engine/security/
- Gunicorn Config: https://docs.gunicorn.org/en/stable/configure.html
