const redis = require("redis");
let client;
let isRedisConnected = false; // Track connection status

const connectToRedis = async () => {
    try {
        client = redis.createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });

        client.on("connect", () => {
            isRedisConnected = true;
            console.log("Connected to Redis");
        });

        client.on("error", (err) => {
            console.error("Redis Client Error", err);
            isRedisConnected = false;
        });

        await client.connect();
    } catch (error) {
        console.error("Failed to connect to Redis:", error.message);
        isRedisConnected = false;
    }
};

const getRedisClient = () => {
    if (!isRedisConnected) {
        console.warn("Redis is not available. Proceeding without Redis.");
        return null; // No Redis client, no caching
    }
    return client;
};

module.exports = { connectToRedis, getRedisClient };
