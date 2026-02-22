# Google Cloud Run Deployment Guide

## Prerequisites

### 1. Install Google Cloud CLI

**Windows:**
Download and run: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe

Or via Chocolatey:
```powershell
choco install google-cloud-sdk
```

**Verify installation:**
```powershell
gcloud --version
```

### 2. Create Google Cloud Project

```powershell
# Set your project ID (use lowercase, no spaces)
$PROJECT_ID = "loc8-project-123"

gcloud projects create $PROJECT_ID --name="LOC8 Application"
gcloud config set project $PROJECT_ID
```

### 3. Enable Required APIs

```powershell
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable compute.googleapis.com
```

### 4. Authenticate gcloud

```powershell
gcloud auth login
gcloud auth application-default login
```

---

## Step 1: Configure Project ID

Edit this file and set your project ID, then run:

```powershell
$PROJECT_ID = "your-project-id"
$REGION = "us-central1"  # or your preferred region

gcloud config set project $PROJECT_ID
```

---

## Step 2: Build Docker Images

```powershell
cd d:\ENGINEERING\Hackathon\LOC8\Development

# Build backend
docker build -f Backend\Dockerfile -t gcr.io/$PROJECT_ID/loc8-backend:latest Backend/

# Build frontend
docker build -f Frontend\Dockerfile -t gcr.io/$PROJECT_ID/loc8-frontend:latest Frontend/
```

---

## Step 3: Push Images to Google Container Registry

```powershell
# Configure Docker authentication for GCR
gcloud auth configure-docker

# Push backend image
docker push gcr.io/$PROJECT_ID/loc8-backend:latest

# Push frontend image
docker push gcr.io/$PROJECT_ID/loc8-frontend:latest
```

---

## Step 4: Deploy Backend to Cloud Run

```powershell
gcloud run deploy loc8-backend `
  --image gcr.io/$PROJECT_ID/loc8-backend:latest `
  --platform managed `
  --region $REGION `
  --port 8000 `
  --memory 512Mi `
  --cpu 1 `
  --allow-unauthenticated `
  --set-env-vars "GNEWS_API_KEY=615b84a159a4dfc1977aa3503dc6ffb2" `
  --timeout 3600
```

**This will output a service URL like:** `https://loc8-backend-xxxxx.run.app`

---

## Step 5: Deploy Frontend to Cloud Run

```powershell
$BACKEND_URL = "https://loc8-backend-xxxxx.run.app"  # Use the URL from Step 4

gcloud run deploy loc8-frontend `
  --image gcr.io/$PROJECT_ID/loc8-frontend:latest `
  --platform managed `
  --region $REGION `
  --port 3000 `
  --memory 256Mi `
  --cpu 1 `
  --allow-unauthenticated `
  --set-env-vars "VITE_API_BASE_URL=$BACKEND_URL/api,VITE_CLERK_PUBLISHABLE_KEY=pk_test_cG9wdWxhci1tYWxhbXV0ZS0zNC5jbGVyay5hY2NvdW50cy5kZXYk" `
  --timeout 3600
```

**This will output a service URL like:** `https://loc8-frontend-xxxxx.run.app`

---

## Step 6: Access Your Application

✅ Frontend: `https://loc8-frontend-xxxxx.run.app`
✅ Backend: `https://loc8-backend-xxxxx.run.app`
✅ API Docs: `https://loc8-backend-xxxxx.run.app/docs`

---

## Monitoring & Logs

```powershell
# View logs for backend
gcloud run logs read loc8-backend --limit 50

# View logs for frontend
gcloud run logs read loc8-frontend --limit 50

# Stream logs in real-time
gcloud run logs read loc8-backend --follow
```

---

## Update Environment Variables

If you need to change the GNEWS API key:

```powershell
gcloud run services update loc8-backend `
  --update-env-vars "GNEWS_API_KEY=new_key_here" `
  --region $REGION
```

---

## Pricing

- **Requests**: 2 million/month free
- **vCPU**: 180,000 vCPU-seconds/month free (~$0.00002/vCPU-second after)
- **Memory**: 360,000 GB-seconds/month free
- **Outbound data**: 1 GB/month free

**Cost for your app**: ~$0/month (stays within free tier)

---

## Cleanup/Delete Services

```powershell
gcloud run services delete loc8-backend --region $REGION
gcloud run services delete loc8-frontend --region $REGION
```

---

## Troubleshooting

### Port Issues
Cloud Run requires port 8000 for backend, 3000 for frontend (handled automatically)

### Environment Variables Not Set
Use `gcloud run services update` to modify env vars

### CORS Issues
If frontend can't reach backend, update frontend env var with correct backend URL

### Logs Not Showing
```powershell
gcloud run logs read loc8-backend --region $REGION --limit 100
```

---

## Complete Deployment Script

See `gcloud-deploy.ps1` for automated deployment
