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

class ApplicationService {
    /**
     * Create an application with the given name.
     * @param {string} name The name of the application.
     * @returns {Promise<Object>} The created application object with id, name and token.
     * @throws {Error} If the application creation fails.
     */
    async createApplication(name) {
        try {
            // Create the application in the database
            const application = await applicationRepository.create({ name });

            // Format the response
            const response = responseFormatter(application);
            const cachedData = JSON.stringify(response);

            // Cache the created application with both token and id
            const cacheKeyByToken = `application:token:${application.token}`;
            const cacheKeyById = `application:id:${application.id}`;

            try {
                // Cache the data with token as the main key
                await RedisClient.setCache(
                    cacheKeyByToken,
                    cachedData,
                    5 * TIME_CONSTANTS.MINUTE
                );

                // Add a reference for the id pointing to the token
                await RedisClient.setCache(
                    cacheKeyById,
                    null,
                    5 * TIME_CONSTANTS.MINUTE,
                    cacheKeyByToken
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
            // Check Redis cache
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

            // Fetch from DB if not cached
            const { count, rows } =
                await applicationRepository.findAllWithCount(filterParams);
            const pagination = paginationBuilder(filterParams, count);
            const response = { data: rows?.map(responseFormatter), pagination };

            // Cache the result for a short duration
            try {
                await RedisClient.setCache(
                    cacheKey,
                    JSON.stringify(response),
                    2 * TIME_CONSTANTS.MINUTE
                ); // 2 minutes expiry
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
     * @param {string} token - The unique token of the application to be retrieved
     * @returns {Promise<Application>} - The application if found, or null otherwise
     * @throws {Error} - If there is an error during the operation
     */
    async getApplicationByToken(token) {
        try {
            // Try fetching from cache using the token
            let application = null;
            try {
                application = await RedisClient.getCache(
                    `application:token:${token}`
                );
                if (application) {
                    return JSON.parse(application);
                }
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, proceeding without cache",
                    cacheError
                );
            }

            application = await applicationRepository.findByToken(token);

            // Format the response
            const formattedResponse = responseFormatter(application);

            // Cache the result
            try {
                // Cache using token as the primary key
                await RedisClient.setCache(
                    `application:token:${token}`,
                    JSON.stringify(formattedResponse),
                    TIME_CONSTANTS.HOUR
                );

                // Add a reference for the ID
                await RedisClient.setCache(
                    `application:id:${application.id}`,
                    null,
                    TIME_CONSTANTS.HOUR,
                    `application:token:${token}`
                );
            } catch (cacheError) {
                console.warn(
                    "Redis unavailable, could not cache result",
                    cacheError
                );
            }

            return formattedResponse;
        } catch (error) {
            console.error(`Failed to retrieve application: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update an application by its token.
     * @param {string} token - The unique token of the application to be updated
     * @param {Object} updates - The updates to be applied to the application
     * @returns {Promise<Application>} - The updated application
     * @throws {Error} - If there is an error during the operation
     */
    async updateApplicationByToken(token, updates) {
        try {
            const { name } = updates;
            const updatedApplication =
                await applicationRepository.updateByToken(token, { name });

            // Format the response
            const formattedResponse = responseFormatter(updatedApplication);

            // Update cache
            try {
                // Update the main cache entry by token
                await RedisClient.setCache(
                    `application:token:${token}`,
                    JSON.stringify(formattedResponse),
                    TIME_CONSTANTS.HOUR
                );

                // Update the reference cache for ID
                await RedisClient.setCache(
                    `application:id:${updatedApplication.id}`,
                    null,
                    TIME_CONSTANTS.HOUR,
                    `application:token:${token}`
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
     * Updates an application by its Id
     * @param {number} id - The unique id of the application to be updated
     * @param {Object} updates - The updates to be applied to the application
     * @returns {Promise<Application>} - The updated application
     * @throws {NotFoundError} - If the application is not found
     * @throws {Error} - If there is an error during the operation
     */
    async updateApplicationById(id, updates) {
        try {
            const { name } = updates;
            const updatedApplication = await applicationRepository.updateById(
                id,
                { name }
            );

            // Format the response
            const formattedResponse = responseFormatter(updatedApplication);

            try {
                // Update the main cache entry by token
                await RedisClient.setCache(
                    `application:token:${token}`,
                    JSON.stringify(formattedResponse),
                    TIME_CONSTANTS.HOUR
                );

                // Update the reference cache for ID
                await RedisClient.setCache(
                    `application:id:${updatedApplication.id}`,
                    null,
                    TIME_CONSTANTS.HOUR,
                    `application:token:${token}`
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
     * Deletes an application by its token
     * @param {string} token - The unique token of the application to be deleted
     * @returns {Promise<void>} - A promise that resolves when the application is deleted
     * @throws {NotFoundError} - If the application is not found
     * @throws {Error} - If there is an error during the operation
     */
    async deleteApplicationByToken(token) {
        try {
            // Delete the application from the database
            const application = await applicationRepository.deleteByToken(
                token
            );
            try {
                // Delete the primary cache by token
                await RedisClient.deleteCache(`application:token:${token}`);

                // Delete the reference cache by ID
                if (application?.id) {
                    await RedisClient.deleteCache(
                        `application:id:${application.id}`
                    );
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
