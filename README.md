# Getting Started

This repo contains code that deploys all the necessary cloud resources for the telemetry project. 

The deployment does the following:
- Compresses and uploads our cloud function code into a storage bucket
- Initializes our pub/sub topic and sets the write policy to allow the Particle service to publish to it
- Initializes our cloud function with code from the storage bucket to fire on publish events

The components interact like so:

```
|----------------|      |---------|      |----------------|      |-----------|
| Particle Board | ---> | Pub/Sub | ---> | Cloud Function | ---> | Datastore |
|________________|      |_________|      |________________|      |___________|
```

In addition, the build script will also enable the right APIs, set the right IAM permissions, and deploy the datastore index needed.

## Build Script

```
./build.sh
```

This assumes you're running the script within the cloud console, because it depends on some variables.

## Manual Setup

Enable the Cloud Functions API, Cloud Pub/Sub API, Cloud Build API, Cloud Deployment Manager API.

The deployment manager service account requires `roles/pubsub.admin`, `roles/storage.admin` to the account `PROJECT_NUMBER@cloudservices.gserviceaccount.com`.

Then run the deployment `gcloud deployment-manager deployments create [deployment_name] --config config.yaml`.

Finally, set up our datastore by creating the Datastore and setting up the indices in `datastore/index.yaml`.

## Deleting

You'll have to manually delete what's in the bucket first, but then simply run `gcloud deployment-manager deployments delete [deployment_name]`. The permissions and APIs will have to be manually removed.

## Addendum

The cloud function will expect the data that comes from the particle to follow the format of `{epoch_timestamp}||{data}`, to record the time the data was taken.
