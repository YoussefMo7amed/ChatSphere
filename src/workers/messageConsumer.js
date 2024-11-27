const { getChannel } = require("../config/rabbitmq");
const messageRepository = require("../app/repositories/messageRepository");
const chatRepository = require("../app/repositories/chatRepository");
const elasticsearch = require("../config/elasticsearch");

async function consumeMessageCreation() {
    const channel = getChannel();
    const queue = "message_creation_queue";

    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        if (msg) {
            const messageData = JSON.parse(msg.content.toString());
            console.log("Processing message creation:", messageData);

            try {
                // Persist message to MySQL
                // await messageRepository.create(messageData);

                // // Update chat's messages_count
                // await chatRepository.incrementMessagesCount(messageData.chatId);

                // // Update ElasticSearch index
                // await elasticsearch.index({
                //     index: "messages",
                //     id: messageData.id,
                //     body: messageData,
                // });

                // channel.ack(msg); // Acknowledge successful processing
                console.log(`message received ${msg}`);
            } catch (error) {
                console.error("Failed to process message creation:", error);
                channel.nack(msg, false, true); // Requeue message for retry
            }
        }
    });
}

module.exports = { consumeMessageCreation };
