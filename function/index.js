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
    datastore
        .save({
            key: key,
            data: createParticleEventObjectForStorage(message)
        })
        .then(() => {
            console.log(
                "Particle event stored in Datastore!\r\n",
                createParticleEventObjectForStorage(message, true)
            );
        })
        .catch(err => {
            console.log("There was an error storing the event:", err);
        });
};

createParticleEventObjectForStorage = (message, log) => {
    let obj = {
        device_id: message.textPayload.attributes.device_id,
        event: message.textPayload.attributes.event,
        data: Buffer.from(message.textPayload.data, "base64").toString(),
        published_at: message.textPayload.attributes.published_at
    };
    return obj;
};
