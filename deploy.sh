#!/bin/bash

# Google Cloud Run Deployment Script for InterBridge
# Run this from your project root

set -e

echo "🚀 Deploying InterBridge to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Google Cloud project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Using project: $PROJECT_ID"

# Build and deploy
echo "🔨 Building and deploying..."
gcloud run deploy interbridge \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --max-instances 10

echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: You need to set the DATABASE_URL secret:"
echo "   gcloud run services update interbridge \\"
echo "     --set-secrets DATABASE_URL=database-url:latest \\"
echo "     --region us-central1"
echo ""
echo "⚠️  Optional: Set Gmail App Password for email notifications:"
echo "   gcloud run services update interbridge \\"
echo "     --set-secrets GMAIL_APP_PASSWORD=gmail-password:latest \\"
echo "     --region us-central1"
