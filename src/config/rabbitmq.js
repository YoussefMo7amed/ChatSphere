const amqp = require("amqplib");

let channelPromise;

async function connectRabbitMQ() {
    if (!channelPromise) {
        channelPromise = (async () => {
            try {
                const connection = await amqp.connect(
                    process.env.RABBITMQ_URL || "amqp://localhost"
                );
                const channel = await connection.createChannel();
                if (!channel) {
                    throw new Error("Failed to create channel.");
                }
                console.log("RabbitMQ connection established.");
                return channel;
            } catch (error) {
                console.error("Failed to connect to RabbitMQ:", error);
                throw error;
            }
        })();
    }
    return channelPromise;
}

async function getChannel() {
    const channel = await connectRabbitMQ();
    return channel;
}

module.exports = { connectRabbitMQ, getChannel };
