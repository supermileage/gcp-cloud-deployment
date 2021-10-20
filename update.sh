#!/bin/bash
gcloud deployment-manager deployments create $GOOGLE_CLOUD_PROJECT-deploy --config config.yaml
