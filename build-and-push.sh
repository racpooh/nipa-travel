#!/bin/bash

# NIPA Container Registry Configuration
REGISTRY="registry.nipa.cloud/cu-intern-project"
VERSION="v1.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Building and Pushing NIPA Travel App to NIPA Container Registry${NC}"
echo "Registry: $REGISTRY"
echo "Version: $VERSION"
echo ""

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    handle_error "Docker is not running. Please start Docker first."
fi

# Check if we're in the right directory
if [[ ! -d "backend" || ! -d "frontend" ]]; then
    handle_error "Please run this script from the project root directory (should contain 'backend' and 'frontend' folders)"
fi

# Build Backend
echo -e "${BLUE}📦 Building Backend Image...${NC}"
cd backend || handle_error "Backend directory not found"

docker build \
    --tag "backend:${VERSION}" \
    --tag "backend:latest" \
    --platform linux/amd64 \
    . || handle_error "Backend build failed"

log_success "Backend image built successfully"

# Build Frontend
echo -e "${BLUE}📦 Building Frontend Image...${NC}"
cd ../frontend || handle_error "Frontend directory not found"

docker build \
    --tag "frontend:${VERSION}" \
    --tag "frontend:latest" \
    --platform linux/amd64 \
    . || handle_error "Frontend build failed"

log_success "Frontend image built successfully"

# Tag images for NIPA Registry (following NIPA format exactly)
echo -e "${BLUE}🏷️  Tagging Images for NIPA Registry...${NC}"

# Tag Backend - NIPA format: registry.nipa.cloud/cu-intern-project/IMAGE[:TAG]
docker tag "backend:${VERSION}" "${REGISTRY}/backend:${VERSION}"
docker tag "backend:latest" "${REGISTRY}/backend:latest"

# Tag Frontend - NIPA format: registry.nipa.cloud/cu-intern-project/IMAGE[:TAG]
docker tag "frontend:${VERSION}" "${REGISTRY}/frontend:${VERSION}"
docker tag "frontend:latest" "${REGISTRY}/frontend:latest"

log_success "Images tagged for NIPA Registry"

# Check if logged in to registry
echo -e "${BLUE}🔐 Checking NIPA Registry Login...${NC}"
log_info "Make sure you're logged in with: docker login registry.nipa.cloud"

# Push to NIPA Registry
echo -e "${BLUE}🚀 Pushing Images to NIPA Container Registry...${NC}"

# Push Backend - using exact NIPA format
log_info "Pushing backend images..."
docker push "${REGISTRY}/backend:${VERSION}" || handle_error "Backend push failed"
docker push "${REGISTRY}/backend:latest" || handle_error "Backend latest push failed"

# Push Frontend - using exact NIPA format
log_info "Pushing frontend images..."
docker push "${REGISTRY}/frontend:${VERSION}" || handle_error "Frontend push failed"
docker push "${REGISTRY}/frontend:latest" || handle_error "Frontend latest push failed"

log_success "All images pushed successfully!"

# Clean up local images (optional)
read -p "Do you want to clean up local images? (y/N): " cleanup
if [[ $cleanup =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧹 Cleaning up local images...${NC}"
    docker rmi "backend:${VERSION}" "backend:latest" 2>/dev/null || true
    docker rmi "frontend:${VERSION}" "frontend:latest" 2>/dev/null || true
    docker rmi "${REGISTRY}/backend:${VERSION}" "${REGISTRY}/backend:latest" 2>/dev/null || true
    docker rmi "${REGISTRY}/frontend:${VERSION}" "${REGISTRY}/frontend:latest" 2>/dev/null || true
    log_success "Local images cleaned up"
fi

# Display final information
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}Backend Image:${NC} ${REGISTRY}/backend:${VERSION}"
echo -e "${BLUE}Frontend Image:${NC} ${REGISTRY}/frontend:${VERSION}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Verify images in NIPA Container Registry"
echo "2. Set up Kubernetes deployment with these image names"
echo "3. Configure ingress and services"

cd ..