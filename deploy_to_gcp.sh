#!/bin/bash
set -e

echo "=================================================="
echo "🚀 STARTING SSC ZONE DEPLOYMENT TO GOOGLE CLOUD"
echo "=================================================="

# Detect GCP Project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  PROJECT_ID="project-2f316930-f1ce-4f26-aa2"
  echo "⚠️ Project ID was unset, using default: $PROJECT_ID"
  gcloud config set project "$PROJECT_ID"
else
  echo "✅ Active Google Cloud Project: $PROJECT_ID"
fi

REGION="asia-south1"
SERVICE_NAME="ssczone"
IMAGE_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/${SERVICE_NAME}:latest"

echo ""
echo "📦 Step 1/2: Building & Pushing Docker container with Cloud Build..."
echo "--------------------------------------------------"
gcloud builds submit --config cloudbuild.yaml .

echo ""
echo "🚢 Step 2/2: Deploying to Google Cloud Run (${SERVICE_NAME})..."
echo "--------------------------------------------------"
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_URL" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10

echo ""
echo "=================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "🌐 Live URL:"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'
echo "=================================================="
