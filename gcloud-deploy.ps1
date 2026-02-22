# Automated Google Cloud Run Deployment Script

param(
    [string]$ProjectId = "loc8-project",
    [string]$Region = "us-central1",
    [string]$GnewsApiKey = "615b84a159a4dfc1977aa3503dc6ffb2",
    [switch]$SkipBuild = $false,
    [switch]$SkipPush = $false
)

# Color output
function Write-Success { Write-Host "$args" -ForegroundColor Green }
function Write-Error { Write-Host "ERROR: $args" -ForegroundColor Red }
function Write-Info { Write-Host "INFO: $args" -ForegroundColor Cyan }

# Step 1: Check prerequisites
Write-Info "Checking prerequisites..."

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker not found. Install Docker Desktop first."
    exit 1
}

Write-Success "Prerequisites OK"

# Step 2: Set project
Write-Info "Setting Google Cloud project to $ProjectId..."
gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set project. Create project first: gcloud projects create $ProjectId"
    exit 1
}

# Step 3: Enable APIs
Write-Info "Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable compute.googleapis.com

# Step 4: Build images
if (-not $SkipBuild) {
    Write-Info "Building Docker images..."
    
    Write-Info "Building backend image..."
    docker build -f Backend\Dockerfile -t gcr.io/$ProjectId/loc8-backend:latest Backend/
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend build failed"
        exit 1
    }
    Write-Success "Backend image built"
    
    Write-Info "Building frontend image..."
    docker build -f Frontend\Dockerfile -t gcr.io/$ProjectId/loc8-frontend:latest Frontend/
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed"
        exit 1
    }
    Write-Success "Frontend image built"
} else {
    Write-Info "Skipping build (--SkipBuild)"
}

# Step 5: Push images
if (-not $SkipPush) {
    Write-Info "Pushing images to Google Container Registry..."
    
    Write-Info "Configuring Docker authentication..."
    gcloud auth configure-docker -q
    
    Write-Info "Pushing backend image..."
    docker push gcr.io/$ProjectId/loc8-backend:latest
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push backend image"
        exit 1
    }
    Write-Success "Backend image pushed"
    
    Write-Info "Pushing frontend image..."
    docker push gcr.io/$ProjectId/loc8-frontend:latest
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push frontend image"
        exit 1
    }
    Write-Success "Frontend image pushed"
} else {
    Write-Info "Skipping push (--SkipPush)"
}

# Step 6: Deploy backend
Write-Info "Deploying backend to Cloud Run..."
gcloud run deploy loc8-backend `
  --image gcr.io/$ProjectId/loc8-backend:latest `
  --platform managed `
  --region $Region `
  --port 8000 `
  --memory 512Mi `
  --cpu 1 `
  --allow-unauthenticated `
  --set-env-vars "GNEWS_API_KEY=$GnewsApiKey" `
  --timeout 3600 `
  --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy backend"
    exit 1
}

Write-Success "Backend deployed successfully"

# Get backend URL
$BackendUrl = gcloud run services describe loc8-backend --platform managed --region $Region --format='value(status.url)'
Write-Success "Backend URL: $BackendUrl"

# Step 7: Deploy frontend
Write-Info "Deploying frontend to Cloud Run..."
gcloud run deploy loc8-frontend `
  --image gcr.io/$ProjectId/loc8-frontend:latest `
  --platform managed `
  --region $Region `
  --port 3000 `
  --memory 256Mi `
  --cpu 1 `
  --allow-unauthenticated `
  --set-env-vars "VITE_API_BASE_URL=$BackendUrl/api,VITE_CLERK_PUBLISHABLE_KEY=pk_test_cG9wdWxhci1tYWxhbXV0ZS0zNC5jbGVyay5hY2NvdW50cy5kZXYk" `
  --timeout 3600 `
  --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy frontend"
    exit 1
}

Write-Success "Frontend deployed successfully"

# Get frontend URL
$FrontendUrl = gcloud run services describe loc8-frontend --platform managed --region $Region --format='value(status.url)'
Write-Success "Frontend URL: $FrontendUrl"

# Step 8: Display results
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: $FrontendUrl" -ForegroundColor Cyan
Write-Host "🔌 Backend:  $BackendUrl" -ForegroundColor Cyan
Write-Host "📚 API Docs: $BackendUrl/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "💾 Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "📍 Region:     $Region" -ForegroundColor Yellow
Write-Host ""
Write-Host "View logs:"
Write-Host "  gcloud run logs read loc8-backend --region $Region"
Write-Host "  gcloud run logs read loc8-frontend --region $Region"
Write-Host ""
Write-Host "Update env vars:"
Write-Host "  gcloud run services update loc8-backend --update-env-vars GNEWS_API_KEY=new_key --region $Region"
Write-Host ""
Write-Host "Delete services:"
Write-Host "  gcloud run services delete loc8-backend --region $Region"
Write-Host "  gcloud run services delete loc8-frontend --region $Region"
