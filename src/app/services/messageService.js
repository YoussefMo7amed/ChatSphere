const chatService = require("../services/chatService");

const chatRepository = require("../repositories/chatRepository");
const messageRepository = require("../repositories/messageRepository");

const { RedisClient, TIME_CONSTANTS } = require("../../utils/cacheUtils");
const { paginationBuilder } = require("../../utils/shared");

/**
 * Formats a message and chat object into a standardized response format.
 *
 * @param {Object} message - The message object to format.
 * @param {number} message.number - The number associated with the message.
 * @param {string} message.body - The content of the message.
 * @param {string} message.created_at - The timestamp when the message was created.
 * @param {Object} chat - The chat object associated with the message.
 * @param {number} chat.number - The number associated with the chat.
 * @param {string} chat.token - The token associated with the chat.
 * @returns {Object} The formatted response object containing message and chat details.
 * @returns {number} return.number - The number of the message.
 * @returns {string} return.body - The body of the message.
 * @returns {number} return.chatNumber - The number of the chat.
 * @returns {string} return.token - The token of the chat.
 * @returns {string} return.createdAt - The creation timestamp of the message.
 */
const responseFormatter = (message, chat) => {
    return {
        number: message.number,
        body: message.body,
        createdAt: message.created_at,
    };
};
class MessageService {
    /**
     * Creates the Redis key for a list of messages
     * @param {string} applicationToken - The token of the application
     * @param {number} chatNumber - The number of the chat
     * @param {boolean} [formatted=true] - Whether the response is formatted or not
     * @param {object} [filterParams={page: 1, limit: 50}] - The filter parameters for the query
     * @returns {string} - The Redis key
     */
    createRedisMessagesKey(
        applicationToken,
        chatNumber,
        formatted = true,
        { page = 1, limit = 50 }
    ) {
        return `chat:${applicationToken}:${chatNumber}:messages:${page}:${limit}:${
            formatted ? "formatted" : "raw"
        }`;
    }
    /**
     * Add a message to a chat with caching optimization
     * @param {string} applicationToken - The token of the application
     * @param {number} chatNumber - The number of the chat
     * @param {string} body - The content of the message
     * @returns {Promise<object>} - The created message
     */
    async createMessage(applicationToken, chatNumber, body) {
        const chatCacheKey = chatService.createRedisChatKey(
            applicationToken,
            chatNumber,
            false
        );

        let chat = await RedisClient.getCache(chatCacheKey);
        if (!chat) {
            chat = await chatService.getChat(
                applicationToken,
                chatNumber,
                false
            );
            if (!chat) throw new Error("Chat not found");

            await RedisClient.setCache(
                chatCacheKey,
                JSON.stringify(chat),
                TIME_CONSTANTS.ONE_HOUR
            );
        } else {
            chat = JSON.parse(chat);
        }

        const messageCounterKey = chatService.messageCounterKey(
            applicationToken,
            chatNumber
        );
        let messageCount = RedisClient.getCache(messageCounterKey);
        if (!messageCount) {
            const currentMessageCount = messageRepository.count(chat.id);
            RedisClient.setCache(
                messageCounterKey,
                currentMessageCount,
                TIME_CONSTANTS.HOUR
            );
        }

        const nextMessageNumber = await RedisClient.increment(
            messageCounterKey
        );

        const message = await messageRepository.create({
            number: nextMessageNumber,
            body,
            chat_id: chat.id,
            application_id: chat.application_id,
        });

        await chatRepository.incrementMessagesCount(chat.id);
        await RedisClient.deleteCache(chatCacheKey);

        const recentMessagesKey = `chat:${applicationToken}:${chatNumber}:recentMessages:raw`;
        await RedisClient.deleteCache(recentMessagesKey);

        return responseFormatter(message, chat);
    }

    /**
     * Create multiple messages in bulk with cache invalidation
     * @param {string} applicationToken - The application token
     * @param {number} chatNumber - The chat number
     * @param {Array} messages - The list of messages to create
     */
    async createBulkMessages(applicationToken, chatNumber, messages) {
        const chatCacheKey = `chat:${applicationToken}:${chatNumber}:raw`;

        // Get chat details from cache or DB
        let chat = await RedisClient.getCache(chatCacheKey);
        if (!chat) {
            chat = await chatService.getChat(
                applicationToken,
                chatNumber,
                false
            );
            if (!chat) throw new Error("Chat not found");

            await RedisClient.setCache(
                chatCacheKey,
                JSON.stringify(chat),
                "EX",
                TIME_CONSTANTS.ONE_HOUR
            );
        } else {
            chat = JSON.parse(chat);
        }

        // Bulk-create messages
        await messageRepository.createMany(
            messages.map((message) => ({
                ...message,
                chat_id: chat.id,
                application_id: chat.application_id,
            }))
        );

        // Invalidate cache
        const recentMessagesKey = `chat:${applicationToken}:${chatNumber}:recentMessages:raw`;
        await RedisClient.deleteCache(recentMessagesKey);
    }

    /**
     * Get a specific message with caching
     * @param {string} applicationToken - The application token
     * @param {number} chatNumber - The chat number
     * @param {number} messageNumber - The message number
     * @returns {Promise<object>} - The message
     */
    async getMessage(applicationToken, chatNumber, messageNumber) {
        const messageKey = `message:${applicationToken}:${chatNumber}:${messageNumber}:raw`;

        // Attempt to fetch message from cache
        let cachedMessage = await RedisClient.getCache(messageKey);
        if (cachedMessage) return JSON.parse(cachedMessage);

        // Fetch from DB if not in cache
        const chat = await chatService.getChat(
            applicationToken,
            chatNumber,
            false
        );
        if (!chat) throw new Error("Chat not found");

        const message = await messageRepository.findByNumberAndChatId(
            chat.id,
            messageNumber
        );
        if (!message) throw new Error("Message not found");

        // Cache message
        await RedisClient.setCache(
            messageKey,
            JSON.stringify(message),
            "EX",
            TIME_CONSTANTS.ONE_HOUR
        );
        return message;
    }

    /**
     * Fetch recent messages with caching
     * @param {string} applicationToken - The application token
     * @param {number} chatNumber - The chat number
     * @returns {Promise<Array>} - The list of recent messages
     */
    async getRecentMessages(applicationToken, chatNumber) {
        const limit = 50;
        const recentMessagesKey = `chat:${applicationToken}:${chatNumber}:recentMessages:raw`;

        let cachedMessages = await RedisClient.getCache(recentMessagesKey);
        if (cachedMessages) return JSON.parse(cachedMessages);

        const chat = await chatService.getChat(
            applicationToken,
            chatNumber,
            false
        );
        if (!chat) throw new Error("Chat not found");

        const messages = await messageRepository.findAllByChatId(chat.id, {
            limit,
            order: [["created_at", "DESC"]],
        });

        await RedisClient.setCache(
            recentMessagesKey,
            JSON.stringify(messages),
            TIME_CONSTANTS.ONE_HOUR
        );
        return messages;
    }

    /**
     * Retrieve all messages for a specific chat with pagination and caching.
     * If messages are cached, they are returned directly from the cache.
     * Otherwise, fetches messages from the database, caches them, and returns.
     *
     * @param {string} applicationToken - The token of the application.
     * @param {number} chatNumber - The number of the chat.
     * @param {object} filterParams - The filter parameters, including pagination details (e.g., page, limit).
     * @returns {Promise<Array>} - A promise that resolves to an array of messages.
     * @throws {Error} - If the chat is not found.
     */
    async getAllMessages(applicationToken, chatNumber, filterParams) {
        try {
            const { page, limit, sortBy } = filterParams;
            const cacheKey = `${this.createRedisMessagesKey(
                applicationToken,
                chatNumber,
                true,
                { page, limit }
            )}`;

            let cachedMessages = await RedisClient.getCache(cacheKey);
            if (cachedMessages) return JSON.parse(cachedMessages);

            const chat = await chatService.getChat(
                applicationToken,
                chatNumber,
                false
            );

            const { rows, count } = await messageRepository.findAllByChatId(
                chat.id,
                {
                    ...filterParams,
                    sortBy: sortBy ?? "-created_at",
                }
            );
            const pagination = paginationBuilder(filterParams, count);
            const response = {
                data: rows?.map((message) =>
                    responseFormatter(message, chat.id)
                ),
                pagination,
                chatNumber: chat.number,
                token: chat.token,
            };
            try {
                await RedisClient.setCache(
                    cacheKey,
                    JSON.stringify(response),
                    5 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.error(cacheError);
                console.warn(
                    "Redis unavailable, could not cache result",
                    cacheError
                );
            }

            return response;
        } catch (error) {
            console.error("Error in getAllMessages:", error);
            throw error;
        }
    }

    /**
     * Update a message and invalidate related cache
     * @param {string} applicationToken - The application token
     * @param {number} chatNumber - The chat number
     * @param {number} messageNumber - The message number
     * @param {Object} updates - The updates to apply
     */
    async updateMessage(applicationToken, chatNumber, messageNumber, updates) {
        const chat = await chatService.getChat(
            applicationToken,
            chatNumber,
            false
        );
        if (!chat) throw new Error("Chat not found");

        const messageKey = `message:${applicationToken}:${chatNumber}:${messageNumber}:raw`;
        const recentMessagesKey = `chat:${applicationToken}:${chatNumber}:recentMessages:raw`;

        // Perform update in DB
        await messageRepository.update(
            { chatId: chat.id, number: messageNumber },
            updates
        );

        // Invalidate caches
        await RedisClient.deleteCache(messageKey);
        await RedisClient.deleteCache(recentMessagesKey);
    }
}

module.exports = new MessageService();
