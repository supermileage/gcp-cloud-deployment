const { BigQuery } = require("@google-cloud/bigquery");

const bigQuery = new BigQuery({
  projectId: process.env.projectId,
});

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */
exports.handler = (pubSubEvent, context) => {
  console.log(pubSubEvent);
  console.log(context);
  const json = JSON.parse(Buffer.from(pubSubEvent.data, "base64").toString());
  const items = json.d.map((e) => ({
    device_id: pubSubEvent.attributes.device_id,
    event: e.t,
    data: isNaN(e.d) ? e.d : Number(e.d).toString(),
    published_at: pubSubEvent.attributes.published_at,
    recorded_at: new Date(parseInt(json.time * 1000)).toISOString(),
  }));
  bigQuery
    .dataset(process.env.datasetName)
    .table(process.env.tableName)
    .insert(items)
    .then(() => {
      console.log("Events successfully stored in BigQuery!");
    })
    .catch((err) => {
      console.log("There was an error storing the event:", err);
    });
};
