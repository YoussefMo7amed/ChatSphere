const { getRedisClient } = require("../config/redis");

const TIME_CONSTANTS = {
    SECOND: 1,
    MINUTE: 60,
    HOUR: 3600,
    DAY: 86400,
    WEEK: 604800,
};

class RedisClient {
    /**
     * Retrieves a value from Redis cache.
     * If the key starts with 'ref:', assumes the value is a reference to another key
     * and retrieves that key's value instead.
     * @param {string} key - Cache key to retrieve
     * @returns {Promise<string | null>} - Retrieved value or null if Redis unavailable
     */
    static async getCache(key) {
        const client = getRedisClient();
        if (!client) {
            console.warn("Redis is unavailable, not caching.");
            return null; // Return null if Redis is unavailable
        }

        try {
            const value = await client.get(key);
            if (key.startsWith("ref:") && value) {
                // Get the referenced key's value
                return await client.get(value);
            }
            return value;
        } catch (error) {
            console.warn(`Redis error while getting cache: ${error.message}`);
            return null;
        }
    }

    /**
     * Stores a value in the Redis cache with an optional time-to-live (TTL).
     * If a reference is provided, stores the reference instead of the actual value.
     *
     * @param {string} key - Cache key to store the value under.
     * @param {string|Buffer} value - The value to cache.
     * @param {number} [ttl=TIME_CONSTANTS.HOUR] - Time-to-live for the cached item in seconds.
     * @param {string|null} [ref=null] - Optional reference key pointing to the actual key.
     */
    static async setCache(key, value, ttl = TIME_CONSTANTS.HOUR, ref = null) {
        const client = getRedisClient();
        if (!client) {
            console.warn("Redis is unavailable, not caching.");
            return; // Return if Redis is unavailable
        }

        try {
            if (ref) {
                // If a reference is provided, link it to the actual key
                await client.set(key, ref, { EX: ttl });
            } else {
                // Otherwise, store the value directly
                await client.set(key, value, { EX: ttl });
            }
        } catch (error) {
            console.warn(`Redis error while setting cache: ${error.message}`);
        }
    }

    /**
     * Deletes a value from Redis cache.
     * @param {string} key - Cache key to delete
     * @returns {Promise<void>}
     */
    static async deleteCache(key) {
        const client = getRedisClient();
        if (!client) {
            console.warn("Redis is unavailable, not deleting cache.");
            return; // Return if Redis is unavailable
        }

        try {
            await client.del(key);
        } catch (error) {
            console.warn(`Redis error while deleting cache: ${error.message}`);
        }
    }
}

module.exports = {
    TIME_CONSTANTS,
    RedisClient,
};
