const { Worker } = require("worker_threads");
const cron = require("node-cron");
const { consumeChatCreation } = require("../workers/chatConsumer");
const { getChannel } = require("../config/rabbitmq");

function startChatCountJob() {
    console.log("Scheduling chat count job...");

    cron.schedule("*/10 * * * * *", () => {
        consumeChatCreation(getChannel);
    });

    console.log("Chat count job scheduled successfully.");
}

module.exports = { startChatCountJob };
