const applicationRepository = require("../repositories/applicationRepository");
const { RedisClient, TIME_CONSTANTS } = require("../../utils/cacheUtils");
const { paginationBuilder } = require("../../utils/shared");

/**
 * Formats an application object into a response object, only exposing the name, token and messages count.
 * @param {Application} application - The application object to be formatted.
 * @returns {Object} - The formatted response object.
 */
const responseFormatter = (application) => {
    return {
        name: application.name,
        token: application.token,
        chats_count: application.chats_count,
    };
};

/**
 * Creates a Redis key for an application based on its identifier.
 * If the identifier is an `id`, it creates a reference key pointing to the corresponding token key.
 * @param {string} identifier - The token or ID of the application.
 * @param {boolean} isToken - Whether the identifier is a token (true) or an ID (false).
 * @param {boolean} formatted - Whether the key is for formatted or raw data.
 * @returns {string} - The Redis key for the application.
 */
function createRedisApplicationKey(
    identifier,
    isToken = true,
    formatted = false
) {
    const keyType = isToken ? "token" : "id";
    const dataType = formatted ? "formatted" : "raw";
    const key = `application:${keyType}:${identifier}:${dataType}`;

    // If it's an ID, return a ref key to the corresponding token key
    if (!isToken) {
        return `ref:application:token:${identifier}:${dataType}`;
    }

    return key;
}

class ApplicationService {
    /**
     * Create an application with the given name.
     * @param {string} name The name of the application.
     * @returns {Promise<Object>} The created application object with id, name and token.
     * @throws {Error} If the application creation fails.
     */
    async createApplication(name) {
        try {
            const application = await applicationRepository.create({ name });

            const response = responseFormatter(application);
            const cachedData = JSON.stringify(response);

            const cacheKeyByToken = createRedisApplicationKey(
                application.token,
                true,
                true
            );
            const cacheKeyById = createRedisApplicationKey(
                application.id,
                false,
                true
            );

            try {
                await RedisClient.setCache(
                    cacheKeyByToken,
                    cachedData,
                    5 * TIME_CONSTANTS.MINUTE
                );

                await RedisClient.setCache(
                    cacheKeyById,
                    cacheKeyByToken,
                    5 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, proceeding without cache",
                    cacheError
                );
            }

            return response;
        } catch (error) {
            console.error(`Failed to create application: ${error.message}`);
            throw new Error(`Failed to create application: ${error.message}`);
        }
    }

    /**
     * Retrieve all applications with the given pagination and filtering parameters.
     * If available, fetches from Redis cache, otherwise fetches from the database and caches the result.
     * @param {Object} filterParams - The filtering and pagination parameters.
     * @returns {Promise<Object>} - An object with the list of applications (data) and pagination details.
     * @throws {Error} - If there is an error retrieving applications.
     */
    async getAllApplications(filterParams) {
        const cacheKey = `applications:page:${filterParams.page}:limit:${filterParams.limit}`;
        try {
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

            const { count, rows } =
                await applicationRepository.findAllWithCount(filterParams);
            const pagination = paginationBuilder(filterParams, count);
            const response = { data: rows?.map(responseFormatter), pagination };

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
            console.error(
                `Failed to retrieve all applications: ${error.message}`
            );
            throw new Error(
                `Failed to retrieve all applications: ${error.message}`
            );
        }
    }
    /**
     * Retrieve an application by its token.
     * If available, fetches from Redis cache, otherwise fetches from the database and caches the result.
     * @param {string} token - The token of the application to be retrieved.
     * @param {boolean} [formatted=true] - Whether to format the response or not.
     * @returns {Promise<Object>} - The application object, either formatted or not.
     * @throws {Error} - If there is an error retrieving the application.
     */
    async getApplicationByToken(token, formatted = true) {
        const cacheKey = createRedisApplicationKey(token, true, formatted);

        try {
            let application = null;
            try {
                application = await RedisClient.getCache(cacheKey);
                if (application) {
                    return JSON.parse(application);
                }
            } catch (cacheError) {
                console.warn("Redis cache read failed:", cacheError);
            }

            application = await applicationRepository.findByToken(token);

            if (!application) {
                throw new Error(`Application not found for token: ${token}`);
            }

            const response = formatted
                ? responseFormatter(application)
                : application;

            const idCacheKey = createRedisApplicationKey(
                application.id,
                false,
                formatted
            );
            try {
                await RedisClient.setCache(
                    cacheKey,
                    JSON.stringify(response),
                    2 * TIME_CONSTANTS.MINUTE
                );

                await RedisClient.setCache(
                    idCacheKey,
                    cacheKey,
                    2 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.warn("Redis cache write failed:", cacheError);
            }

            return response;
        } catch (error) {
            console.error(`Failed to retrieve application: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update an application by its token.
     * @param {string} token - The unique token of the application to be updated.
     * @param {Object} updates - The updates to be applied to the application.
     * @returns {Promise<Application>} - The updated application.
     * @throws {Error} - If there is an error during the operation.
     */
    async updateApplicationByToken(token, updates) {
        try {
            const { name } = updates;

            const updatedApplication =
                await applicationRepository.updateByToken(token, { name });

            const formattedResponse = responseFormatter(updatedApplication);

            const tokenCacheKey = createRedisApplicationKey(token, true, true);
            const idCacheKey = createRedisApplicationKey(
                updatedApplication.id,
                false,
                true
            );

            try {
                await RedisClient.setCache(
                    tokenCacheKey,
                    JSON.stringify(formattedResponse),
                    2 * TIME_CONSTANTS.MINUTE
                );

                await RedisClient.setCache(
                    idCacheKey,
                    tokenCacheKey,
                    2 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, could not update cache",
                    cacheError
                );
            }

            return formattedResponse;
        } catch (error) {
            console.error(`Failed to update application: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update an application by its ID.
     * @param {string} id - The unique ID of the application to be updated.
     * @param {Object} updates - The updates to be applied to the application.
     * @returns {Promise<Object>} - The updated application object.
     * @throws {Error} - If there is an error during the operation.
     */
    async updateApplicationById(id, updates) {
        try {
            const { name } = updates;

            const updatedApplication = await applicationRepository.updateById(
                id,
                { name }
            );

            const formattedResponse = responseFormatter(updatedApplication);

            const tokenCacheKey = createRedisApplicationKey(
                updatedApplication.token,
                true,
                true
            );
            const idCacheKey = createRedisApplicationKey(
                updatedApplication.id,
                false,
                true
            );

            try {
                await RedisClient.setCache(
                    tokenCacheKey,
                    JSON.stringify(formattedResponse),
                    2 * TIME_CONSTANTS.MINUTE
                );

                await RedisClient.setCache(
                    idCacheKey,
                    tokenCacheKey,
                    2 * TIME_CONSTANTS.MINUTE
                );
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, could not update cache",
                    cacheError
                );
            }

            return formattedResponse;
        } catch (error) {
            console.error(`Failed to update application: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deletes an application by its token.
     * @param {string} token - The unique token of the application to be deleted.
     * @returns {Promise<void>} - A promise that resolves when the application is deleted.
     * @throws {Error} - If there is an error during the operation.
     */
    async deleteApplicationByToken(token) {
        try {
            const application = await applicationRepository.deleteByToken(
                token
            );

            const tokenCacheKey = createRedisApplicationKey(token, true, true);
            const idCacheKey = application?.id
                ? createRedisApplicationKey(application.id, false, true)
                : null;

            try {
                await RedisClient.deleteCache(tokenCacheKey);

                if (idCacheKey) {
                    await RedisClient.deleteCache(idCacheKey);
                }
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, could not invalidate cache",
                    cacheError
                );
            }
        } catch (error) {
            console.error(`Failed to delete application: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ApplicationService();
