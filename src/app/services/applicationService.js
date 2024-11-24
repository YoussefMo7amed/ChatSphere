const applicationRepository = require("../repositories/applicationRepository");
const { generateToken } = require("../../utils/tokenGenerator");
const { paginationBuilder, NotFoundError } = require("../../utils/shared");
// todo , create pagination, update the swagger

/**
 * Formats an application object into a response object, only exposing the name and token.
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
     * Creates a new application.
     * @param {string} name - The name of the application.
     * @returns {Promise<Application>} - The newly created application.
     */
    async createApplication(name) {
        try {
            const application = await applicationRepository.create({
                name,
            });
            return responseFormatter(application);
        } catch (error) {
            console.error(`Failed to create application: ${error.message}`);
            throw new Error(`Failed to create application: ${error.message}`);
        }
    }

    /**
     * Retrieves all applications.
     * @returns {Promise<Application[]>} - A promise that resolves to the list of applications.
     */
    async getAllApplications(filterParams) {
        try {
            const { count, rows } =
                await applicationRepository.findAllWithCount(filterParams);

            const pagination = paginationBuilder(filterParams, count);

            return { data: rows?.map(responseFormatter), pagination };
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
     * Retrieves an application by its token.
     * @param {string} token - The unique token of the application.
     * @returns {Promise<Application|null>} - A promise that resolves to the application if found, or null otherwise.
     */
    async getApplicationByToken(token) {
        try {
            const application = await applicationRepository.findByToken(token);
            return responseFormatter(application);
        } catch (error) {
            console.error(`Failed to retrieve application: ${error.message}`);
            throw error;
        }
    }

    /**
     * Updates an application by its token.
     * @param {string} token - The unique token of the application to be updated.
     * @param {Object} updates - The updates to be applied to the application.
     * @returns {Promise<Application>} - A promise that resolves to the updated application.
     */
    async updateApplicationByToken(token, updates) {
        try {
            const { name } = updates;
            const updatedApplication =
                await applicationRepository.updateByToken(token, { name });
            return responseFormatter(updatedApplication);
        } catch (error) {
            console.error(`Failed to update application: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deletes an application by its token.
     * @param {string} token - The unique token of the application to be deleted.
     * @returns {Promise<void>} - A promise that resolves when the application is deleted.
     */
    async deleteApplicationByToken(token) {
        try {
            await applicationRepository.deleteByToken(token);
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete application: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ApplicationService();
