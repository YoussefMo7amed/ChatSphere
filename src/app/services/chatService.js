const chatRepository = require("../repositories/chatRepository");
const applicationService = require("./applicationService");
const { paginationBuilder, NotFoundError } = require("../../utils/shared");
const { RedisClient, TIME_CONSTANTS } = require("../../utils/cacheUtils");
const { sequelize } = require("../models");
/**
 * Formats a chat object into a response object, only exposing the number and messages count.
 * The application token is also included if the application is provided.
 * @param {Chat} chat - The chat object to be formatted.
 * @param {Application} [application] - The application object, used to include the token in the response.
 * @returns {Object} - The formatted response object.
 */
const responseFormatter = (chat, application) => {
    return {
        token: application?.token,
        number: chat.number,
        messages_count: chat.messages_count,
    };
};

/**
 * Creates the key for Redis given the application token, chat number, and format.
 * @param {string} applicationToken - The application token.
 * @param {number} chatNumber - The chat number.
 * @param {boolean} [formatted=true] - Whether the response is formatted or not.
 * @returns {string} - The Redis key.
 */
const createRedisMessageKey = (
    applicationToken,
    chatNumber,
    formatted = true
) => {
    return `chat:${applicationToken}:${chatNumber}:${
        formatted ? "formatted" : "raw"
    }`;
};

class ChatService {
    /**
     * Creates a new chat associated with an application token.
     * Caches the newly created chat if successful.
     * @param {string} applicationToken - The token of the application for which the chat is being created.
     * @returns {Promise<Object>} - The newly created chat object, formatted.
     * @throws {Error} - If there is an error during the creation process.
     */
    async createChat(applicationToken) {
        const transaction = await sequelize.transaction();

        try {
            const application = await applicationService.getApplicationByToken(
                applicationToken,
                false
            );
            if (!application) {
                throw new NotFoundError("Application not found");
            }

            const chat = await chatRepository.create(
                {
                    application_id: application.id,
                    messages_count: 0,
                },
                transaction
            );

            await transaction.commit();

            const response = responseFormatter(chat, application);

            const cacheKey = createRedisMessageKey(
                application.token,
                chat.number,
                true
            );
            try {
                await RedisClient.setCache(
                    cacheKey,
                    JSON.stringify(response),
                    5 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.error(cacheError);
                console.warn(
                    "Redis unavailable, could not cache the new chat",
                    cacheError
                );
            }

            return response;
        } catch (error) {
            console.error(error);
            await transaction.rollback();
            console.error(`Error creating chat: ${error.message}`);
            throw error;
        }
    }
    /**
     * Retrieve all chats for a specified application with pagination and filtering options.
     * Results are cached for performance.
     * @param {string} applicationToken - The unique token of the application.
     * @param {object} filterParams - The filtering and pagination parameters (e.g., page, limit).
     * @returns {Promise<object>} - An object containing the list of chats, pagination details, and application token.
     * @throws {NotFoundError} - If the application is not found.
     * @throws {Error} - If there is an error retrieving chats.
     */
    async getChats(applicationToken, filterParams) {
        try {
            const cacheKey = `${createRedisMessageKey(
                applicationToken,
                "all"
            )}:page:${filterParams.page}:limit:${filterParams.limit}`;

            let cachedResult;
            try {
                cachedResult = await RedisClient.getCache(cacheKey);
            } catch (cacheError) {
                console.error(cacheError);
                console.warn(
                    "Redis unavailable, could not fetch cached result",
                    cacheError
                );
            }
            if (cachedResult) return JSON.parse(cachedResult);

            const application = await applicationService.getApplicationByToken(
                applicationToken,
                false
            );
            if (!application) {
                throw new NotFoundError("Application not found");
            }

            const { count, rows } = await chatRepository.findAllByApplicationId(
                application.id,
                filterParams
            );

            const pagination = paginationBuilder(filterParams, count);

            const response = {
                data: rows?.map((chat) => responseFormatter(chat, application)),
                pagination,
                token: application.token,
            };

            try {
                await RedisClient.setCache(
                    cacheKey,
                    JSON.stringify(response),
                    2 * TIME_CONSTANTS.MINUTE
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
            console.error(`Error retrieving chats: ${error.message}`);
            console.error(error);
            throw new Error(`Error retrieving chats: ${error.message}`);
        }
    }

    /**
     * Retrieve a chat by its chat number and associated application token.
     * If available, fetches from Redis cache, otherwise fetches from the database and caches the result.
     * @param {string} applicationToken - The token of the application to which the chat belongs.
     * @param {string|number} chatNumber - The number of the chat to be retrieved.
     * @param {boolean} [formatted=true] - Whether to format the response or not.
     * @returns {Promise<Object>} - The chat object, either formatted or not.
     * @throws {Error} - If there is an error retrieving the chat.
     */
    async getChat(applicationToken, chatNumber, formatted = true) {
        try {
            const application = await applicationService.getApplicationByToken(
                applicationToken,
                false
            );
            if (!application) {
                throw new NotFoundError("Application not found");
            }

            const cacheKey = createRedisMessageKey(
                applicationToken,
                chatNumber,
                formatted
            );

            let cachedChat;
            try {
                cachedChat = await RedisClient.getCache(cacheKey);
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, could not fetch chat from cache",
                    cacheError
                );
            }

            if (cachedChat) {
                return JSON.parse(cachedChat);
            }

            const chat = await chatRepository.findByNumberAndApplicationId(
                chatNumber,
                application.id
            );

            const response = formatted
                ? responseFormatter(chat, application)
                : chat;

            try {
                await RedisClient.setCache(
                    cacheKey,
                    JSON.stringify(response),
                    2 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.error(cacheError);
                console.warn(
                    "Redis unavailable, could not cache chat",
                    cacheError
                );
            }

            return response;
        } catch (error) {
            console.error(error);
            console.error(`Error getting chat: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deletes a chat by its chat number and associated application token.
     * Removes cache entry if present.
     * @param {string} applicationToken - The token of the application to which the chat belongs.
     * @param {string|number} chatNumber - The number of the chat to be deleted.
     * @returns {Promise<void>}
     * @throws {Error} - If there is an error deleting the chat.
     */
    async deleteChat(applicationToken, chatNumber) {
        const transaction = await sequelize.transaction();

        try {
            const chat = await this.getChat(
                applicationToken,
                chatNumber,
                false
            );

            if (!chat) {
                throw new NotFoundError("Chat not found");
            }

            await chatRepository.deleteById(chat.id, transaction);

            const cacheKeyFormatted = createRedisMessageKey(
                applicationToken,
                chatNumber,
                true
            );
            const cacheKeyRaw = createRedisMessageKey(
                applicationToken,
                chatNumber,
                false
            );

            try {
                await RedisClient.deleteCache(cacheKeyFormatted);
                await RedisClient.deleteCache(cacheKeyRaw);
            } catch (cacheError) {
                console.error(cacheError);
                console.warn(
                    "Redis unavailable, could not delete chat from cache",
                    cacheError
                );
            }
            return;
        } catch (error) {
            console.error(`Error deleting chat: ${error.message}`);
            console.error(error);
            throw error;
        }
    }
}

module.exports = new ChatService();
