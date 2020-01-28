const Datastore = require("@google-cloud/datastore");

const datastore = Datastore({
  projectId: process.env.projectId
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
  storeEvent(pubSubEvent);
};

storeEvent = message => {
  let key = datastore.key("ParticleEvent");
  let particleEvent = createParticleEventObjectForStorage(message);
  datastore
    .save({
      key: key,
      data: particleEvent
    })
    .then(() => {
      console.log("Particle event stored in Datastore!\r\n", particleEvent);
    })
    .catch(err => {
      console.log("There was an error storing the event:", err);
    });
};

createParticleEventObjectForStorage = message => {
  let msg = Buffer.from(message.data, "base64")
    .toString()
    .split("||");
  let obj = {
    device_id: message.attributes.device_id,
    event: message.attributes.event,
    data: msg[1],
    published_at: message.attributes.published_at,
    recorded_at: new Date(parseInt(`${msg[0]}000`)).toISOString()
  };
  return obj;
};
