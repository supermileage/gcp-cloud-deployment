#!/bin/bash

# Region, is configurable
REGION=us-central
ACCOUNT_NUM=$(gcloud projects list --filter="projectId:$GOOGLE_CLOUD_PROJECT" | grep PROJECT_NUMBER | cut -d' ' -f2)

# Enable the APIs
gcloud services enable pubsub.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable deploymentmanager.googleapis.com

# Enable Glob imports
gcloud config set deployment_manager/glob_imports True

# Set the correct IAM permissions
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT --member serviceAccount:$ACCOUNT_NUM@cloudservices.gserviceaccount.com --role roles/pubsub.admin
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT --member serviceAccount:$ACCOUNT_NUM@cloudservices.gserviceaccount.com --role roles/storage.admin

# Deploy the configuration
gcloud deployment-manager deployments create $GOOGLE_CLOUD_PROJECT-deploy --config config.yaml
