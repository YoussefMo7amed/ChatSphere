const amqp = require("amqplib");

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(
            process.env.RABBITMQ_URL || "amqp://localhost"
        );
        channel = await connection.createChannel();
        console.log("RabbitMQ connection established.");
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error);
        throw error;
    }
}

function getChannel() {
    if (!channel) {
        throw new Error(
            "RabbitMQ channel not initialized. Call connectRabbitMQ first."
        );
    }
    return channel;
}

module.exports = { connectRabbitMQ, getChannel };
