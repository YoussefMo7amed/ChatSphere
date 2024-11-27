const { connectToRabbitMQ } = require("../config/rabbitmq");
const { indexDataIntoElasticsearch } = require("../config/elasticsearch");

const QUEUE_NAME = "data_changes_queue";
const RABBITMQ_URL = "amqp://localhost";

const startWorker = async () => {
    const { connection, channel } = await connectToRabbitMQ(RABBITMQ_URL);

    // Ensure the queue exists
    channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Waiting for messages in ${QUEUE_NAME}...`);
    channel.consume(QUEUE_NAME, async (msg) => {
        const data = JSON.parse(msg.content.toString());
        console.log(data);
        // Process message (e.g., index to Elasticsearch)
        // await indexDataIntoElasticsearch(data);

        // Acknowledge the message
        channel.ack(msg);
    });
};

startWorker().catch((err) => console.error("Error in worker:", err));
