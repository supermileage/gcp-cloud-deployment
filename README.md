# Getting Started

## Automating It

```
./build.sh
```

This assumes you're running the script within the cloud console, because it depends on some variables.

# Manual Setup

Enable the Cloud Functions API, Cloud Pub/Sub API, Cloud Build API, Cloud Deployment Manager API.

The deployment manager service account requires `roles/pubsub.admin`, `roles/storage.admin` to the account `PROJECT_NUMBER@cloudservices.gserviceaccount.com`.

Then run the deployment `gcloud deployment-manager deployments create [deployment_name] --config config.yaml`.

Finally, set up our datastore by creating the Datastore and setting up the indices in `datastore/index.yaml`.

# Deleting

You'll have to manually delete what's in the bucket first, but then simply run `gcloud deployment-manager deployments delete [deployment_name]`