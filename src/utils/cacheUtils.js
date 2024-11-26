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
            return;
        }
        try {
            if (ref) {
                await client.set(key, ref, { EX: ttl });
            } else {
                await client.set(key, value, { EX: ttl });
            }
        } catch (error) {
            console.warn(`Redis error while setting cache: ${error.message}`);
            throw error;
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
    /**
     * Increments a value in Redis cache.
     * @param {string} key - Cache key to increment
     * @param {number} [increment=1] - Optional increment value
     * @returns {Promise<number>} - The new count
     */
    static async increment(key, increment = 1) {
        const client = getRedisClient();
        if (!client) {
            console.warn("Redis is unavailable, not incrementing cache.");
            return null; // Return null if Redis is unavailable
        }

        try {
            const newValue = await client.incrBy(key, increment); // Use incrBy
            console.log(
                `New value after incrementing by ${increment}: ${newValue}`
            );
            return newValue;
        } catch (error) {
            console.warn(
                `Redis error while incrementing cache: ${error.message}`
            );
            throw error;
        }
    }

    /**
     * Decrements a value in Redis cache.
     * @param {string} key - Cache key to decrement
     * @param {number} [decrement=1] - Optional decrement value
     * @returns {Promise<number>} - The new count
     */
    static async decrement(key, decrement = 1) {
        const client = getRedisClient();
        if (!client) {
            console.warn("Redis is unavailable, not decrementing cache.");
            return null; // Return null if Redis is unavailable
        }

        try {
            const newValue = await client.decrBy(key, decrement); // Use decrBy
            return newValue; // Return the new value
        } catch (error) {
            console.warn(
                `Redis error while decrementing cache: ${error.message}`
            );
            throw error;
        }
    }

    /**
     * Retrieves all values from Redis cache that match a given prefix.
     * @param {string} prefix - The prefix to match keys against.
     * @returns {Promise<Object>} - An object containing keys and their corresponding values.
     */
    static async getValuesByPrefix(prefix) {
        const client = getRedisClient();
        if (!client) {
            console.warn("Redis is unavailable, not retrieving values.");
            return null; // Return null if Redis is unavailable
        }

        try {
            const keys = await client.keys(`${prefix}*`);
            const values = await Promise.all(
                keys.map((key) => client.get(key))
            );
            return keys.reduce((acc, key, index) => {
                acc[key] = values[index];
                return acc;
            }, {});
        } catch (error) {
            console.warn(
                `Redis error while getting values by prefix: ${error.message}`
            );
            return null;
        }
    }

    /**
     * Deletes all keys from Redis cache that match a given prefix.
     * @param {string} prefix - The prefix to match keys against.
     * @returns {Promise<void>}
     */
    static async deleteByPrefix(prefix) {
        const client = getRedisClient();
        if (!client) {
            console.warn("Redis is unavailable, not deleting values.");
            return; // Return if Redis is unavailable
        }

        try {
            const keys = await client.keys(`${prefix}*`);
            if (keys.length > 0) {
                await client.del(keys);
                console.log(
                    `Deleted ${keys.length} keys with prefix "${prefix}"`
                );
            } else {
                console.log(`No keys found with prefix "${prefix}"`);
            }
        } catch (error) {
            console.warn(
                `Redis error while deleting by prefix: ${error.message}`
            );
        }
    }
}

module.exports = {
    TIME_CONSTANTS,
    RedisClient,
};
