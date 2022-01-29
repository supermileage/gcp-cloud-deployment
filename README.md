# Getting Started

This repo contains code that deploys all the necessary cloud resources for the telemetry project. 

The deployment does the following:
- Compresses and uploads our cloud function code into a storage bucket
- Initializes our pub/sub topic and sets the write policy to allow the Particle service to publish to it
- Initializes a BigQuery dataset and table with the schema in [the template](templates/bigquery-telemetry.jinja)
- Initializes a cloud function to execute on pubsub events, writing to BigQuery
- Initializes a cloud function to proxy BigQuery queries which Grafana can use

The components interact like so:

```
   ┌─────────────────┐    ┌───────┐     ┌────────────────┐
   │                 │    │       │     │                │
   │ Particle Board  ├───►│Pub/Sub├────►│ Cloud Function │
   │                 │    │       │     │                │
   └─────────────────┘    └───────┘     └────────┬───────┘
                                                 │
                                                 │
                                          ┌──────▼──────┐
                                          │             │
                                          │  Big Query  │
                                          │             │
                                          └──────▲──────┘
                                                 │
                                                 │
               ┌──────────────────┐     ┌────────┴───────┐
               │                  │     │                │
               │ Managed Grafana  ├────►│ Cloud Function │
               │                  │     │                │
               └──────────────────┘     └────────────────┘

```

In addition, the build script will also enable the right APIs and set the right IAM permissions.

## Grafana Setup

The Grafana instance should use the [JSON API](https://grafana.com/grafana/plugins/marcusolsson-json-datasource/) data source to grab data from our BigQuery table. Note that each build will also generate a random API key as a first-line defense toward unauthorized queries; this should be retrieved from the Cloud Functions console after a build.

## Build Script

```
./build.sh
```

This assumes you're running the script within the cloud console because it depends on some variables.

## Updating

```
./update.sh
```

In general, updates should be done with the update script rather than tearing things down and rebuilding since our BigQuery tables are part of the deployment.

## Manual Setup

Enable the Cloud Functions API, Cloud Pub/Sub API, Cloud Build API, Cloud Deployment Manager API.

The deployment manager service account requires `roles/pubsub.admin`, `roles/storage.admin`, `roles/cloudfunctions.admin` to the account `PROJECT_NUMBER@cloudservices.gserviceaccount.com`.

Then run the deployment `gcloud deployment-manager deployments create [deployment_name] --config config.yaml`.

## Deleting

You'll have to manually delete what's in the bucket first, but then simply run `gcloud deployment-manager deployments delete [deployment_name]`. The permissions and APIs will have to be manually removed.

## Addendum

The cloud function will expect the data that comes from the particle to be a JSON string with a vehicle (`v`) field and `l` (list) array of objects with `t` (epoch time in seconds) and `d` (Json object)  

So for example, one push may look like:
```json
{
	“v”:”vehicleName”,
	
	“l”: [
		
		{
			
			“t”: 1643078601,
			
			“d”: { “intKey”: 25, “stringKey”: ”stringVal”, ... }
		
		},
		
		{
			
			“t”: 1643078603,
			
			“d”: { “floatKey”: “33.333”, “boolKey”: 1, ... }
		
		},

		...
	]

}
```
