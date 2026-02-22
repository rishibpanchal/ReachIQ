# Docker Quick Start Guide

## Prerequisites
- Docker and Docker Compose installed
- Clone or pull the project

## Quick Start (Development)

### 1. Single Command Startup
```bash
docker-compose up --build
```

This starts:
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Nginx Router**: http://localhost

### 2. Verify Services
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:8000/docs
curl http://localhost:3000
```

### 3. Stop Services
```bash
docker-compose down
```

## Quick Start (Production)

### 1. Prepare Environment
```bash
# Create production env file
cp .env.prod.example .env.prod

# Edit with your production values
# - Change SECRET_KEY
# - Update API endpoints
# - Add API keys for external services
```

### 2. Build and Start
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Verify Deployment
```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Test health
curl http://localhost/health
curl http://localhost/api/docs
```

## Using Helper Scripts

### Linux/Mac
```bash
# Make script executable
chmod +x docker-deploy.sh

# Development
./docker-deploy.sh dev up
./docker-deploy.sh dev logs
./docker-deploy.sh dev shell backend

# Production
./docker-deploy.sh prod build
./docker-deploy.sh prod up
./docker-deploy.sh prod logs backend
```

### Windows
```cmd
REM Development
docker-deploy.bat dev up
docker-deploy.bat dev logs
docker-deploy.bat dev shell backend

REM Production
docker-deploy.bat prod build
docker-deploy.bat prod up
docker-deploy.bat prod logs backend
```

## Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands
```bash
# Run command in backend
docker-compose exec backend python -c "import sys; print(sys.version)"

# Open shell in frontend
docker-compose exec frontend sh

# Run migrations (if applicable)
docker-compose exec backend python manage.py migrate
```

### Rebuild Specific Service
```bash
# Rebuild without stopping others
docker-compose up -d --build backend

# Force rebuild without cache
docker-compose build --no-cache backend
```

### Clean Everything
```bash
# Stop and remove everything
docker-compose down -v

# Remove all Docker images
docker image prune -a

# Full cleanup
docker system prune -a --volumes
```

## Accessing Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React App |
| Backend API | http://localhost:8000 | FastAPI Server |
| API Docs | http://localhost:8000/docs | Swagger Documentation |
| API ReDoc | http://localhost:8000/redoc | ReDoc Documentation |
| Nginx Proxy | http://localhost | Production Router |

## Development Workflow

1. **Make code changes**
   - Changes to `Backend/` auto-reload (Uvicorn)
   - Changes to `Frontend/src/` hot-reload (Vite)

2. **No rebuild needed**
   - Containers stay running with volume mounts
   - Services watch for file changes

3. **Test changes**
   - Visit http://localhost:3000 in browser
   - Check logs: `docker-compose logs -f`

## Environment Variables

### Frontend
- `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:8000/api`)

### Backend
- `DEBUG`: Enable debug mode (development only)
- `PYTHONUNBUFFERED`: Keep output unbuffered (set to 1)
- `CORS_ORIGINS`: Allowed CORS origins
- See `.env.docker` for all options

## Troubleshooting

### Ports Already in Use
```bash
# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # Change 8000 to 8001 on host
  - "3001:3000"  # Change 3000 to 3001 on host
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend

# Run interactively
docker-compose run --rm backend bash
```

### Network Issues
```bash
# Test connectivity
docker-compose exec frontend ping backend

# Check network
docker network inspect reachiq-network
```

### Out of Memory
```bash
# Increase Docker memory limit (Docker Desktop settings)
# Or clean unused images:
docker image prune -a

# Check resource usage
docker stats
```

## Next Steps

1. **Read full guides:**
   - [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Complete deployment guide
   - [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md) - Architecture details

2. **Deploy to cloud:**
   - AWS ECS: `docker push your-registry/reachiq-backend`
   - Google Cloud Run: `gcloud run deploy`
   - Kubernetes: `kompose convert -f docker-compose.prod.yml`

3. **Monitor in production:**
   - Set up logging aggregation
   - Enable health checks and alerts
   - Monitor resource usage
   - Plan scaling strategy

## Support

For issues or questions:
- Check logs: `docker-compose logs -f [service]`
- Review [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- Check Docker documentation: https://docs.docker.com/
