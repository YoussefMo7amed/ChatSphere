const applicationRepository = require("../app/repositories/applicationRepository");
const sequelize = require("sequelize");

async function consumeChatCreation(channel) {
    const queue = "chat_creation_queue";

    await channel.assertQueue(queue, { durable: true });

    const batch = {};

    console.log("Starting batch processing for chat creation...");

    let messageCount = 0;

    // Drain the queue and aggregate occurrences
    while (true) {
        const msg = await channel.get(queue, { noAck: false });
        if (!msg) break;

        try {
            console.log(JSON.parse(msg.content.toString()));
            const applicationToken = JSON.parse(msg.content.toString());
            batch[applicationToken] = (batch[applicationToken] || 0) + 1;
            messageCount++;

            channel.ack(msg);
        } catch (error) {
            console.error("Failed to process chat creation message:", error);
            channel.nack(msg, false, true); // Requeue the message for retry
        }
    }

    if (messageCount === 0) {
        console.log("No messages to process in this batch.");
        return;
    }

    console.log(`Processing ${messageCount} messages...`);
    console.log(batch);
    for (const [applicationToken, count] of Object.entries(batch)) {
        const transaction = await sequelize.transaction();

        try {
            console.log(
                `Incrementing chat count for ${applicationToken} by ${count}`
            );
            await applicationRepository.incrementChatsCount(
                applicationToken,
                count,
                transaction
            );

            // await transaction.commit(); // the commit handled in the repo
            console.log(
                `Chat count for ${applicationToken} updated successfully.`
            );
        } catch (error) {
            // await transaction.rollback(); the rollback handled in the repo
            console.error(
                `Failed to update chat count for ${applicationToken}:`,
                error
            );
        }
    }

    // Clear the batch after processing
    console.log("Batch processing completed.");
    Object.keys(batch).forEach((key) => delete batch[key]);
}

module.exports = { consumeChatCreation };
