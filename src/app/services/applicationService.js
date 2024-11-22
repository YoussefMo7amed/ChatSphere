const applicationRepository = require("../repositories/applicationRepository");
const { generateToken } = require("../../utils/tokenGenerator");

// todo , create pagination, update the swagger

class ApplicationService {
    /**
     * Creates a new application.
     * @param {string} name - The name of the application.
     * @returns {Promise<Application>} - The newly created application.
     */
    async createApplication(name) {
        const token = generateToken();
        return await applicationRepository.create({
            name,
            token,
            chats_count: 0,
        });
    }

    /**
     * Retrieves all applications.
     * @returns {Promise<Application[]>} - A promise that resolves to the list of applications.
     */
    async getAllApplications() {
        return await applicationRepository.findAll();
    }

    /**
     * Retrieves an application by its token.
     * @param {string} token - The unique token of the application.
     * @returns {Promise<Application|null>} - A promise that resolves to the application if found, or null otherwise.
     */
    async getApplicationByToken(token) {
        return await applicationRepository.findByToken(token);
    }

    /**
     * Updates an application by its token.
     * @param {string} token - The unique token of the application to be updated.
     * @param {Object} updates - The updates to be applied to the application.
     * @returns {Promise<Application>} - A promise that resolves to the updated application.
     */
    async updateApplicationByToken(token, updates) {
        return await applicationRepository.updateByToken(token, updates);
    }

    /**
     * Deletes an application by its token.
     * @param {string} token - The unique token of the application to be deleted.
     * @returns {Promise<void>} - A promise that resolves when the application is deleted.
     */
    async deleteApplication(token) {
        return await applicationRepository.deleteByToken(token);
    }
}

module.exports = new ApplicationService();
