const amqp = require("amqplib");
const applicationRepository = require("../app/repositories/applicationRepository");
const { Sequelize } = require("sequelize");
const { getChannel } = require("../config/rabbitmq");

async function consumeChatCreation() {
    const channel = await getChannel();
    const queue = "chat_creation_queue";

    // Assert that the queue exists
    await channel.assertQueue(queue, { durable: true });

    console.log("Starting batch processing for chat creation...");

    const batch = {}; // Store counts for each application token

    // Start consuming messages from the queue
    channel.consume(queue, (msg) => {
        if (msg) {
            try {
                const messageContent = msg.content.toString();
                console.log(`Received message: ${messageContent}`);

                const applicationToken = messageContent; // Assuming the message is just the application token (e.g. app1, app2)

                // Accumulate the count for each application token
                batch[applicationToken] = (batch[applicationToken] || 0) + 1;

                // Acknowledge the message after it has been added to the batch
                channel.ack(msg);
            } catch (error) {
                console.error(
                    "Failed to process chat creation message:",
                    error
                );
                // If there's an error, nack the message and requeue it
                channel.nack(msg, false, true);
            }
        }
    });

    // Give some time for all messages to be consumed before processing the batch
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // After processing all messages, log and process the batch
    if (Object.keys(batch).length === 0) {
        console.log("No messages to process in this batch.");
        return;
    }

    // Print the accumulated batch counts
    console.log("Batch results:", batch);

    // Begin a database transaction
    let tx;
    try {
        tx = await Sequelize.transaction();
    } catch (error) {
        console.error("Failed to create transaction:", error);
        return;
    }

    // Process each application token in the batch
    for (const [applicationToken, count] of Object.entries(batch)) {
        try {
            console.log(
                `Incrementing chat count for ${applicationToken} by ${count}`
            );

            // Update the chat count for each application token
            await applicationRepository.incrementChatsCount(
                applicationToken,
                count,
                tx
            );

            console.log(
                `Chat count for ${applicationToken} updated successfully.`
            );
        } catch (error) {
            console.error(
                `Failed to update chat count for ${applicationToken}:`,
                error
            );
            // If there's an error, rollback the transaction
            await tx.rollback();
            return;
        }
    }

    // Commit the transaction after all updates
    try {
        await tx.commit();
        console.log("Batch processing completed successfully.");
    } catch (error) {
        console.error("Failed to commit transaction:", error);
        await tx.rollback();
    }

    // Clear the batch after processing
    Object.keys(batch).forEach((key) => delete batch[key]);
}

module.exports = { consumeChatCreation };
