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
 * Creates the key for Redis given the application token and chat number.
 * @param {string} applicationToken - The application token.
 * @param {number} chatNumber - The chat number.
 * @returns {string} - The Redis key.
 */
const createRedisMessageKey = (applicationToken, chatNumber) => {
    return `chat:${applicationToken}:${chatNumber}`;
};

class ChatService {
    async createChat(applicationToken) {
        const transaction = await sequelize.transaction();

        try {
            const application = await applicationService.getApplicationByToken(
                applicationToken,
                false
            );
            if (!application) {
                throw new Error("Application not found");
            }

            const chat = await chatRepository.create(
                {
                    application_id: application.id,
                    messages_count: 0,
                },
                transaction
            );

            // Commit the transaction
            await transaction.commit();
            const response = responseFormatter(application, chat);
            const cacheKey = createRedisMessageKey(
                application.token,
                chat.number
            );
            await RedisClient.setCache(
                cacheKey,
                JSON.stringify(response),
                5 * TIME_CONSTANTS.MINUTE
            );

            return response;
        } catch (error) {
            await transaction.rollback();
            console.error(`Error creating chat: ${error}`);
            throw error;
        }
    }

    /**
     * Retrieve all chats for a specified application with pagination and filtering options.
     * @param {string} applicationToken - The unique token of the application.
     * @param {object} filterParams - The filtering and pagination parameters.
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
                console.warn(
                    "Redis unavailable, could not fetch or cache result",
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
                data: rows?.map(responseFormatter),
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
                console.warn(
                    "Redis unavailable, could not cache result",
                    cacheError
                );
            }

            return response;
        } catch (error) {
            console.error(error);
            throw new Error(`Error getting chats: ${error.message}`);
        }
    }

    /**
     * Get a chat by its number and application token
     * @param {string} applicationToken - The token of the application
     * @param {number} chatNumber - The number of the chat
     * @returns {Promise<object>} - The chat
     */
    async getChat(applicationToken, chatNumber) {
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
                chatNumber
            );
            let cachedChat;
            try {
                cachedChat = await RedisClient.getCache(cacheKey);
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, could not fetch or cache chat",
                    cacheError
                );
            }
            if (cachedChat) return JSON.parse(cachedChat);

            const chat = await chatRepository.findByNumberAndApplicationId(
                application.id,
                chatNumber
            );

            const response = responseFormatter(chat, application);

            try {
                await RedisClient.setCache(
                    cacheKey,
                    JSON.stringify(response),
                    2 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, could not cache chat",
                    cacheError
                );
            }

            return response;
        } catch (error) {
            console.error(`Error getting chat: ${error}`);
            throw error;
        }
    }
}

module.exports = new ChatService();
