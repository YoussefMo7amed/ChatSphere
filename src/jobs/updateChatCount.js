// const { scheduleJob } = require("node-schedule");
// const { RedisClient } = require("../config/redis");
// const chatRepository = require("../app/repositories/chatRepository");

// async function updateChatCount() {
//     scheduleJob("*/5 * * * *", async () => {});
// }

const { parentPort } = require("worker_threads");
const { consumeChatCreation } = require("../workers/chatConsumer");

async function runJob() {
    try {
        await consumeChatCreation()
            .then(() => {
                parentPort.postMessage(
                    "Chat count job completed successfully."
                );
            })
            .catch((error) => {
                console.error("Error in chat count job:", error);
            });
    } catch (error) {
        console.error("Error in chat count job:", error);
        parentPort.postMessage(
            "Chat count job failed. Check logs for details."
        );
    }
}

// Start the job when this worker script is invoked
runJob();
