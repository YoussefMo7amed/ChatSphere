const { parentPort } = require("worker_threads");
const amqp = require("amqplib");
const { consumeChatCreation } = require("../workers/chatConsumer");

async function runJob() {
    try {
        // Create a new RabbitMQ connection for the worker thread
        const connection = await amqp.connect(
            process.env.RABBITMQ_URL || "amqp://localhost"
        );
        const channel = await connection.createChannel();

        // Pass the newly created channel to consumeChatCreation
        await consumeChatCreation(channel);

        parentPort.postMessage("Chat count job completed successfully.");
    } catch (error) {
        console.error("Error in chat count job:", error);
        parentPort.postMessage(
            "Chat count job failed. Check logs for details."
        );
    }
}

runJob();
