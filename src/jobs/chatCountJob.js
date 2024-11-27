const { Worker } = require("worker_threads");
const cron = require("node-cron");

function startChatCountJob() {
    console.log("Scheduling chat count job...");
    //"0 * * * *",
    cron.schedule("*/10 * * * * *", () => {
        console.log("Executing chat count job...");

        const worker = new Worker("./jobs/chatCountWorker.js");

        worker.on("message", (message) => {
            console.log("Worker Message:", message);
        });

        worker.on("error", (error) => {
            console.error("Worker Error:", error);
        });

        worker.on("exit", (code) => {
            if (code !== 0) {
                console.error(`Worker exited with error code: ${code}`);
            } else {
                console.log("Worker finished successfully.");
            }
        });
    });

    console.log("Chat count job scheduled successfully.");
}

module.exports = { startChatCountJob };
