// src/index.js
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const api = require("./app/routes/index");
require("dotenv").config();
const bodyParser = require("body-parser");
const { connectToRedis } = require("./config/redis");
const esClient = require("./config/elasticsearch");
const { connectRabbitMQ } = require("./config/rabbitmq");
const { initializeDatabase } = require("./config/databaseInit");
const { startChatCountJob } = require("./jobs/chatCountJob");
// const { startMessageCountJob } = require("./jobs/messageCountJob");
const { consumeMessageCreation } = require("./workers/messageConsumer");
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Swagger JSON endpoint
app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

app.get("/", (req, res) => {
    res.send(`
        <h1>Welcome to the chat system!</h1>
        <br>
        
        <h2>Checkout the API documentation on <a href="/api-docs">/api-docs</a></h2>
    `);
});

// Initialize services (database, Redis, RabbitMQ, and cron job)
async function initializeServices() {
    // Initialize the database, Redis, RabbitMQ, and cron job
    try {
        await initializeDatabase();
        console.log("Database initialized successfully.");
    } catch (err) {
        console.error("Database initialization failed:", err.message);
    }

    try {
        await connectToRedis();
        console.log("Redis connected successfully.");
    } catch (err) {
        console.error("Redis connection failed:", err.message);
    }

    try {
        connectRabbitMQ()
            .then((channel) => {
                console.log("RabbitMQ connected successfully.");

                console.log("Chat job started.");
                startChatCountJob();

                console.log("Message job started.");
                // startMessageCountJob();
                consumeMessageCreation(channel);
            })
            .catch((error) => {
                console.error("Failed to start jobs:", error);
            });
    } catch (err) {
        console.error("RabbitMQ connection failed:", err.message);
    }

    try {
        await esClient.ping();
        console.log("Elasticsearch connected successfully.");
    } catch (err) {
        console.error("Elasticsearch connection failed:", err.message);
    }
}

// Run the service initialization
initializeServices().catch((err) => {
    console.error("Service initialization failed:", err.message);
    process.exit(1); // Exit the app if service initialization fails
});

// Register API routes
app.use(api);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
