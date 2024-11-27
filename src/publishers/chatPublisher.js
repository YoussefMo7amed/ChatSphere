const { getChannel } = require("../config/rabbitmq");

/**
 * Publishes a message to a queue to notify other services that a chat
 * has been created. The message is sent with the persistent flag set to true
 * to ensure it is not lost in case of a RabbitMQ restart.
 *
 * @param {string} applicationToken - The token of the application for which the chat is being created.
 */
async function publishChatCreation(applicationToken) {
    const channel = getChannel();
    const queue = "chat_creation_queue";

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(applicationToken)), {
        persistent: true,
    });
    console.log("Published chat creation for app:", applicationToken);
}

module.exports = { publishChatCreation };
