const Datastore = require("@google-cloud/datastore");

const datastore = Datastore({
    projectId: process.env.projectId
});

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload and metadata.
 * @param {!Function} callback Callback function to signal completion.
 */
exports.handler = (event, callback) => {
    console.log(event);
    storeEvent(event);
    callback();
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
            console.log(
                "Particle event stored in Datastore!\r\n",
                particleEvent
            );
        })
        .catch(err => {
            console.log("There was an error storing the event:", err);
        });
};

createParticleEventObjectForStorage = (message) => {
    let obj = {
        device_id: message.attributes.device_id,
        event: message.attributes.event,
        data: Buffer.from(message.data, "base64").toString(),
        published_at: message.attributes.published_at
    };
    return obj;
};
