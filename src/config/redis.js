const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

const connectToRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Error connecting to Redis", err);
    }
};

module.exports = { connectToRedis, redisClient };
