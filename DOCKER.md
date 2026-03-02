# Docker Deployment Guide

Complete guide for building, running, and managing the LOC8 application with Docker.

## Overview

The application consists of three main services:
- **Backend API** (Python/FastAPI) - Port 8000
- **Frontend** (React/Vite) - Port 3000  
- **Nginx** (Reverse Proxy) - Port 80/443

All services are defined in `docker-compose.yml` (development) and `docker-compose.prod.yml` (production).

## Prerequisites

- Docker 20.10+
- Docker Compose 1.29+
- Git
- Adequate disk space (images: ~2GB)

### Check Installation

```bash
docker --version
docker-compose --version
```

## Quick Start (Development)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your API keys

# 2. Build and start
docker-compose up --build

# 3. Access services
# Frontend:    http://localhost:3000
# Backend API: http://localhost:8000  
# API Docs:    http://localhost:8000/docs
# Nginx:       http://localhost
```

## Docker Compose Files

### docker-compose.yml (Development)

Used for local development with:
- Code volumes for hot reload
- Detailed logging
- Health checks enabled
- Database in local directory

```bash
docker-compose up --build
```

### docker-compose.prod.yml (Production)

Used for production with:
- Optimized images
- Resource limits
- Production logging
- Database backups

Note: Both files now use the same `.env` file for configuration.

## Common Commands

### Starting Services

```bash
# Build and start
docker-compose up --build

# Start in background (production)
docker-compose up -d --build

# Start without rebuild
docker-compose up

# Start specific service
docker-compose up backend
docker-compose up frontend
```

### Viewing Logs

```bash
# All services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last N lines
docker-compose logs --tail 50 backend
```

### Stopping & Removing

```bash
# Stop services (containers remain)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers AND volumes (WARNING: data loss)
docker-compose down -v

# Remove only volumes
docker-compose rm -v
```

### Container Management

```bash
# List running containers
docker-compose ps

# Get container info
docker-compose ps -a  # Including stopped

# Restart service
docker-compose restart backend

# Execute command in container
docker-compose exec backend python -c "import sys; print(sys.version)"

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# View container resource usage
docker stats
```

## Configuration

### Environment File (.env)

The single `.env` file contains all configuration:

```bash
cp .env.example .env
# Edit with your values
```

**Key Development Settings:**
```bash
DEBUG=true
VITE_API_BASE_URL=http://localhost:8000/api
CORS_ORIGINS=http://localhost:3000,http://localhost
```

**Key Production Settings:**
```bash
DEBUG=false
VITE_API_BASE_URL=/api
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

See [ENV_SETUP.md](ENV_SETUP.md) for complete configuration documentation.

## Building Images

### Build All Images

```bash
# Fresh build (no cache)
docker-compose build --no-cache

# Build specific image
docker-compose build --no-cache backend
docker-compose build frontend
```

### Image Sizes

```bash
# List images
docker images | grep loc8

# Expected sizes:
# Backend:  ~500MB
# Frontend: ~200MB
# Nginx:    ~50MB
```

## Service Details

### Backend (loc8-backend)

**Image**: `royal_flush_loc8a2-backend:latest`
**Base**: Python 3.11-slim
**Port**: 8000
**Health Check**: HTTP request to `/docs`

```dockerfile
# Runs FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Volumes** (development):
- `./Backend:/app` - Code hot reload

**Environment Files**:
- All variables from `.env`

### Frontend (loc8-frontend)

**Image**: `royal_flush_loc8a2-frontend:latest`
**Base**: Node 20-alpine
**Port**: 3000
**Health Check**: HTTP request to `/`

```dockerfile
# Runs Vite dev server
CMD ["npm", "run", "dev"]
```

**Build Process**:
1. Multi-stage build (faster)
2. npm install dependencies
3. Compile TypeScript with `tsc`
4. Build with `vite build`
5. Serve with `serve`

**Environment Vars Required**:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`
- `VITE_SUPABASE_FUNCTION_URL`

### Nginx (loc8-nginx)

**Image**: `nginx:alpine`
**Port**: 80 (443 for HTTPS)
**Config**: `nginx.conf`

Routes:
- `/` → Frontend (port 3000)
- `/api` → Backend (port 8000)

## Troubleshooting

### Port Already in Use

```bash
# Find process on port
lsof -i :3000   # Frontend
lsof -i :8000   # Backend  
lsof -i :80     # Nginx

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Out of Disk Space

```bash
# Check docker disk usage
docker system df

# Clean up (WARNING: removes unused images/volumes)
docker system prune -a

# Remove build cache
docker builder prune
```

### Container Crashes

```bash
# Check logs for errors
docker-compose logs backend

# Rebuild without cache
docker-compose down
docker-compose build --no-cache
docker-compose up

# Check container status
docker-compose ps
docker inspect loc8-backend
```

### Networking Issues

```bash
# Check network
docker network ls
docker network inspect royal_flush_loc8a2_loc8-network

# Services can communicate by container name:
# backend → http://backend:8000
# frontend → http://frontend:3000
```

### Database Connection Issues

```bash
# Check if Supabase credentials are correct in .env
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
docker-compose exec backend python -c \
  "from supabase import create_client; \
   client = create_client('$SUPABASE_URL', '$SUPABASE_SERVICE_ROLE_KEY')"
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Generate new `SECRET_KEY`: `openssl rand -base64 32`
- [ ] Set `DEBUG=false`
- [ ] Use production API keys (not test/dev)
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Update `CORS_ORIGINS` with HTTPS URLs
- [ ] Verify SSL certificates (if using HTTPS)
- [ ] Test with `docker-compose up --build` locally first

### Deploy to Production

```bash
# Pull latest code
git pull origin main

# Update .env for production
cp .env.example .env
# Edit .env with production values

# Deploy
docker-compose -f docker-compose.yml up -d --build

# Verify
docker-compose ps
docker-compose logs -f backend
```

### Health Checks

```bash
# Check backend
curl http://localhost:8000/docs

# Check frontend
curl http://localhost:3000

# Check all services
docker-compose ps  # Should show all "Up"
```

### Monitoring

```bash
# Watch resource usage
docker stats

# Check logs for errors
docker-compose logs --tail 100 backend | grep ERROR

# Monitor application
# Frontend: http://localhost:3000/analytics
# Backend: http://localhost:8000/docs
```

### Updates & Rollback

```bash
# Update code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Rollback (if issues)
git revert HEAD
docker-compose down
docker-compose up -d --build

# View previous versions
git log --oneline
```

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env` files (use `.env.example` template)
   - Use strong `SECRET_KEY` values
   - Rotate API keys regularly

2. **Image Security**
   - Use specific base image versions (not `latest`)
   - Scan for vulnerabilities: `docker scan <image>`
   - Keep dependencies updated

3. **Network Security**
   - Run Nginx for HTTPS termination
   - Restrict CORS origins
   - Use environment-based secrets

4. **Resource Limits**
   - Set memory limits in docker-compose
   - Monitor resource usage
   - Use production compose for deployments

## Advanced Topics

### Custom Networking

```yaml
networks:
  loc8-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect royal_flush_loc8a2_backend_data

# Backup volume
docker run --rm -v src_volume:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data
```

### Docker Swarm (Multi-node)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml loc8
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [FastAPI in Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

## Support

For issues with:
- **Configuration**: See [ENV_SETUP.md](ENV_SETUP.md)
- **Application Setup**: See [README.md](README.md)
- **Backend**: See [Backend/README.md](Backend/README.md)
- **Frontend**: See [Frontend/README.md](Frontend/README.md)
