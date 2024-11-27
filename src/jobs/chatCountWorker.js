const { parentPort } = require("worker_threads");
const amqp = require("amqplib");
const { consumeChatCreation } = require("../workers/chatConsumer");
const { getChannel } = require("../config/rabbitmq");

async function runJob() {
    try {
        let channel;
        try {
            channel = await getChannel();
        } catch (error) {
            console.error("Failed to get RabbitMQ channel:", error);
        }
        // Use the provided channel or create a new one
        const connection = !channel
            ? await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost")
            : null;
        channel = channel ?? (await connection.createChannel());

        // Pass the channel to the consumer
        await consumeChatCreation(channel);
        // await channel.close();
        // await connection.close();
        parentPort.postMessage("Chat count job completed successfully.");
    } catch (error) {
        console.error("Error in chat count job:", error);
        parentPort.postMessage(
            "Chat count job failed. Check logs for details."
        );
    }
}
runJob();
