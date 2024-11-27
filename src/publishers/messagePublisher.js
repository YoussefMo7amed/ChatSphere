const { getChannel } = require("../config/rabbitmq");

/**
 * Publishes a message to a queue to notify other services that a message
 * has been created. The message is sent with the persistent flag set to true
 * to ensure it is not lost in case of a RabbitMQ restart.
 *
 * @param {object} messageData - The message data to be published
 */
async function publishMessageCreation(messageData) {
    const channel = getChannel();
    const queue = "message_creation_queue";

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageData)), {
        persistent: true,
    });

    console.log("Published message creation:", messageData);
}

module.exports = { publishMessageCreation };
