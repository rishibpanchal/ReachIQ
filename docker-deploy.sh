#!/bin/bash

# ReachIQ Docker Deployment Helper Script
# Usage: ./docker-deploy.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENV_MODE="${1:-dev}"
COMPOSE_FILE="docker-compose.yml"

if [ "$ENV_MODE" = "prod" ] || [ "$ENV_MODE" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.prod"
else
    ENV_FILE=".env.docker"
fi

# Functions
print_header() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

check_dependencies() {
    print_header "Checking Dependencies"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose found: $(docker-compose --version)"
}

setup_env() {
    print_header "Setting up Environment"
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ "$ENV_MODE" = "prod" ] || [ "$ENV_MODE" = "production" ]; then
            if [ ! -f ".env.prod.example" ]; then
                print_error "Environment template not found"
                exit 1
            fi
            cp .env.prod.example "$ENV_FILE"
            print_warning "Copied .env.prod.example to .env.prod"
            print_warning "Please update .env.prod with your production values!"
        else
            # Create from .env.docker if it exists
            if [ -f ".env.docker" ]; then
                cp .env.docker "$ENV_FILE"
                print_success "Environment file ready"
            fi
        fi
    else
        print_success "Environment file exists: $ENV_FILE"
    fi
}

build() {
    print_header "Building Docker Images"
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    print_success "Build completed"
}

build_dev() {
    print_header "Building Docker Images (Development)"
    docker-compose -f "$COMPOSE_FILE" build
    print_success "Build completed"
}

pull() {
    print_header "Pulling Latest Base Images"
    docker pull python:3.11-slim
    docker pull node:20-alpine
    docker pull nginx:alpine
    print_success "Images pulled"
}

up() {
    print_header "Starting Services"
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Services started"
    print_status
}

down() {
    print_header "Stopping Services"
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Services stopped"
}

restart() {
    print_header "Restarting Services"
    docker-compose -f "$COMPOSE_FILE" restart
    print_success "Services restarted"
}

logs() {
    SERVICE="${2:-}"
    if [ -n "$SERVICE" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f "$SERVICE"
    else
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

status() {
    print_status
}

print_status() {
    echo -e "${GREEN}Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
}

ps_output() {
    docker-compose -f "$COMPOSE_FILE" ps
}

shell() {
    SERVICE="${2:-backend}"
    print_header "Opening shell in $SERVICE"
    docker-compose -f "$COMPOSE_FILE" exec "$SERVICE" bash 2>/dev/null || docker-compose -f "$COMPOSE_FILE" exec "$SERVICE" sh
}

test_health() {
    print_header "Testing Service Health"
    
    # Test backend
    echo -n "Testing Backend... "
    if curl -s http://localhost:8000/docs > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    # Test frontend
    echo -n "Testing Frontend... "
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is running"
    else
        print_error "Frontend is not responding"
    fi
}

clean() {
    print_header "Cleaning Up"
    docker-compose -f "$COMPOSE_FILE" down -v
    print_success "Services and volumes removed"
}

show_usage() {
    cat << EOF
Usage: $0 [command] [options]

Commands:
    check           Check if dependencies are installed
    setup           Setup environment files
    build           Build images with no cache
    build-dev       Build images with cache
    pull            Pull latest base images
    up              Start services
    down            Stop services
    restart         Restart services
    logs            Show logs (use: logs [service])
    shell           Open shell in service (use: shell [service])
    status          Show service status
    health          Test service health
    clean           Remove all containers and volumes
    help            Show this help message

Environment Modes:
    dev             Development (default)
    prod            Production

Examples:
    $0 dev up       # Start development environment
    $0 prod up      # Start production environment
    $0 logs backend        # View backend logs
    $0 shell frontend      # Open shell in frontend
    $0 prod logs    # View production logs

EOF
}

# Main script
case "${2:-help}" in
    check)
        check_dependencies
        ;;
    setup)
        check_dependencies
        setup_env
        ;;
    build)
        check_dependencies
        setup_env
        build
        ;;
    build-dev)
        check_dependencies
        setup_env
        build_dev
        ;;
    pull)
        pull
        ;;
    up)
        check_dependencies
        setup_env
        up
        ;;
    down)
        down
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    shell)
        shell
        ;;
    status)
        status
        ;;
    health)
        test_health
        ;;
    clean)
        clean
        ;;
    help|*)
        show_usage
        ;;
esac
