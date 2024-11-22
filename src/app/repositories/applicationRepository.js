const { Application, sequelize } = require("../models");

class ApplicationRepository {
    /**
     * Create a new application
     * @param {Object} data - The data to be used to create the application
     * @returns {Promise<Application>} - The newly created application
     */
    async create(data) {
        try {
            return await Application.create(data);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Find an application by its token
     * @param {string} token - The unique token of the application
     * @returns {Promise<Application|null>} - The application if found, or null otherwise
     */
    async findByToken(token) {
        try {
            return await Application.findOne({ where: { token } });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Updates an application by its token with transaction handling
     * @param {string} token - The unique token of the application to be updated
     * @param {Object} updates - The updates to be applied to the application
     * @returns {Promise<Application>} - The updated application
     */
    async updateByToken(token, updates) {
        try {
            return await sequelize.transaction(async (transaction) => {
                const application = await Application.findOne({
                    where: { token },
                    transaction,
                });
                if (!application) throw new Error("Application not found");

                return await application.update(updates, { transaction });
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Delete an application by its token
     * @param {string} token - The unique token of the application to be deleted
     * @returns {Promise<void>} - A promise that resolves when the application is deleted
     */
    async deleteByToken(token) {
        try {
            return await Application.destroy({ where: { token } });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Retrieves all applications
     * @returns {Promise<Application[]>} - A promise that resolves to the list of applications
     */
    async findAll() {
        try {
            return await Application.findAll();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Get the total count of all applications
     * @returns {Promise<number>} - A promise that resolves to the total count
     */
    async count() {
        try {
            return await Application.count();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new ApplicationRepository();
