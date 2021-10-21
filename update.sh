#!/bin/bash
gcloud deployment-manager deployments update $GOOGLE_CLOUD_PROJECT-deploy --config config.yaml
