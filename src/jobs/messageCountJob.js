const { Worker } = require("worker_threads");
const cron = require("node-cron");

const { consumeMessageCreation } = require("../src/workers/messageConsumer");
const { getChannel } = require("../src/config/rabbitmq");
function startMessageCountJob() {
    console.log("Scheduling message count job...");

    cron.schedule("*/15 * * * * *", () => {
        consumeMessageCreation();
    });

    console.log("Message count job scheduled successfully.");
}

module.exports = { startMessageCountJob };
