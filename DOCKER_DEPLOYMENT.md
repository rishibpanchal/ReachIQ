# Docker Deployment Guide for LOC8

This guide explains how to deploy the LOC8 application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git (for cloning the repository)

## Project Structure

```
Development/
├── Backend/              # FastAPI application
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
├── Frontend/             # React + Vite application
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml         # Development compose file
├── docker-compose.prod.yml    # Production compose file
├── .dockerignore               # Docker build ignore patterns
└── nginx.conf                 # Nginx configuration
```

## Quick Start (Development)

1. **Build and run all services:**

```bash
docker-compose up --build
```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Nginx Proxy: http://localhost

3. **Stop all services:**

```bash
docker-compose down
```

## Services

### Backend
- **Container:** `loc8-backend`
- **Port:** 8000
- **Framework:** FastAPI with Uvicorn
- **Environment:** Python 3.11
- **Volume:** `./Backend:/app` (development)
- **Health Check:** Checks `/docs` endpoint

### Frontend
- **Container:** `loc8-frontend`
- **Port:** 3000
- **Framework:** React + Vite
- **Environment:** Node 20 Alpine
- **Build Output:** Optimized `dist` folder
- **Health Check:** Checks root endpoint

### Nginx (Optional/Production)
- **Container:** `loc8-nginx`
- **Port:** 80 (HTTP), 443 (HTTPS)
- **Role:** Reverse proxy, load balancer, static file serving
- **Config:** `nginx.conf`

## Environment Configuration

### Development
The `.env.docker` file contains default development values:
- API endpoints are exposed directly on their ports
- Debug mode can be enabled
- CORS is permissive for development

### Production
For production deployment, use `.env.prod`:

1. **Create `.env.prod` in the root directory:**

```bash
cp .env.docker .env.prod
```

2. **Update sensitive values:**
   - Change `SECRET_KEY` to a strong random value
   - Update database URLs if using external database
   - Add API keys for external services (Clerk, Stripe, etc.)
   - Set `DEBUG=false`
   - Update `ALLOWED_HOSTS` with your domain

## Running in Production

### Using docker-compose.prod.yml

```bash
# Build with production Dockerfile
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Production Optimizations

1. **Backend (`Dockerfile.backend.prod`):**
   - Uses Gunicorn with 4 workers
   - Non-root user for security
   - Gevent worker class for async support
   - Resource limits: 1 CPU, 512MB memory

2. **Frontend (`Dockerfile.frontend.prod`):**
   - Nginx serving static files
   - Gzip compression enabled
   - Static asset caching optimized
   - Resource limits: 1 CPU, 512MB memory

## Common Commands

```bash
# Build images without starting containers
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend

# Execute command in running container
docker-compose exec backend python -c "import sys; print(sys.version)"

# Stop all services
docker-compose stop

# Remove all containers, networks, and volumes
docker-compose down -v

# Rebuild a specific service
docker-compose up -d --build backend
```

## Scaling

### Horizontal Scaling (Multiple Instances)

To run multiple instances of a service:

```bash
docker-compose up -d --scale backend=3
```

**Note:** This requires:
- Nginx configured for load balancing (already configured)
- Stateless backend services
- Shared session storage if needed (Redis recommended)

## Networking

Services communicate via the `loc8-network` bridge network:
- Backend: `http://backend:8000` (from within Docker)
- Frontend: `http://frontend:3000` (from within Docker)
- Nginx: Routes traffic between services

## Volumes

### Development
- Backend code is mounted: Auto-reloading on file changes
- Frontend code is mounted: Vite hot reload works

### Production
Named volumes are used (optional):
- `backend_data`: For any persistent backend data
- `frontend_data`: For frontend assets

## Security Best Practices

1. **Never commit `.env` files** containing secrets
2. **Use strong secrets in production:**
   ```bash
   openssl rand -base64 32
   ```

3. **Enable HTTPS in production:**
   - Uncomment HTTPS section in `nginx.conf`
   - Install SSL certificates (Let's Encrypt recommended)
   - Map volumes for certificates: `./ssl:/etc/nginx/ssl:ro`

4. **Use read-only mounts for config:**
   ```yaml
   volumes:
     - ./nginx.conf:/etc/nginx/nginx.conf:ro
   ```

5. **Run containers as non-root users** (already configured in production)

6. **Turn off debug mode** in production (set `DEBUG=false`)

7. **Update base images regularly:**
   ```bash
   docker pull python:3.11-slim
   docker pull node:20-alpine
   docker pull nginx:alpine
   ```

## Database Integration

### PostgreSQL (Optional)

Add to `docker-compose.yml`:

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: loc8-db
    environment:
      POSTGRES_USER: loc8_user
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: loc8_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - loc8-network
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Update Backend connection:
```bash
DATABASE_URL=postgresql://loc8_user:password@postgres:5432/loc8_db
```

## Monitoring and Logging

### View Container Logs
```bash
docker-compose logs backend
docker-compose logs -f frontend
docker-compose logs --tail=100 nginx
```

### Health Status
```bash
docker-compose ps
```

### Inspect Container
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify requirements are installed
docker-compose exec backend pip list

# Check if port 8000 is in use
netstat -tlnp | grep 8000
```

### Frontend build fails
```bash
# Check logs
docker-compose logs frontend

# Rebuild with no cache
docker-compose build --no-cache frontend

# Check Node version
docker-compose exec frontend node --version
```

### Port conflicts
If ports are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Use 8001 instead of 8000
```

### Network issues between containers
```bash
# Test connectivity
docker-compose exec frontend ping backend

# Check network
docker network ls
docker network inspect loc8-network
```

## Performance Optimization

### Build Cache Optimization
- Dockerfiles are ordered to leverage Docker layer caching
- Dependencies are installed before copying source code
- Minimal base images (alpine variants)

### Memory Optimization
- Multi-stage builds for frontend (reduces final image size)
- Python optimizations: `PYTHONDONTWRITEBYTECODE=1`
- Resource limits configured in `docker-compose.prod.yml`

### Speed Optimization
- Parallel layer building: `docker-compose build --parallel`
- Use `.dockerignore` to exclude unnecessary files
- Nginx caching enabled for static assets

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Push to registry
        run: docker-compose push
```

## Deployment Platforms

### Docker Swarm
```bash
docker stack deploy -c docker-compose.prod.yml loc8
```

### Kubernetes
```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.prod.yml
```

### Cloud Platforms
- **AWS ECS:** Use ECS CLI or AWS Fargate
- **Google Cloud:** Use Google Cloud Run
- **Azure:** Use Azure Container Instances
- **DigitalOcean:** Use App Platform
- **Heroku:** Use Heroku Container Registry

## Cleanup

### Remove all containers and images
```bash
docker-compose down --rmi all
```

### Remove dangling images
```bash
docker image prune -a
```

### Full cleanup
```bash
docker system prune -a --volumes
```

## Support and Resources

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- FastAPI + Docker: https://fastapi.tiangolo.com/deployment/docker/
- Vite + Docker: https://vitejs.dev/guide/ssr.html
