const { getChannel } = require("../config/rabbitmq");
const messageRepository = require("../app/repositories/messageRepository");
const chatRepository = require("../app/repositories/chatRepository");
const elasticsearch = require("../config/elasticsearch");
const { indexMessage } = require("../app/services/searchService");

async function consumeMessageCreation(channel) {
    const queue = "message_creation_queue";

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        if (msg) {
            const messageData = JSON.parse(msg.content.toString());
            console.log(messageData);

            try {
                try {
                    await indexMessage(messageData);
                    channel.ack(msg); // Acknowledge successful processing
                    console.log(`message received ${messageData.number} done`);
                } catch (error) {
                    console.error("Error processing message creation:", error);
                    channel.nack(msg, false, true); // Requeue the message for retry
                }
            } catch (error) {
                console.error("Failed to process message creation:", error);
                channel.nack(msg, false, true); // Requeue message for retry
            }
        }
    });
}

module.exports = { consumeMessageCreation };
