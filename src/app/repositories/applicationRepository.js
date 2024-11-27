const { Application, sequelize } = require("../models");

const { filterParamsToSQL, NotFoundError } = require("../../utils/shared");

class ApplicationRepository {
    _allowedSortingFields = ["created_at", "name"];

    async _performTransaction(operation, transaction = null) {
        const tx = transaction || (await sequelize.transaction());
        return operation(tx);
    }

    async _find(whereClause, transaction) {
        const application = await Application.findOne({
            where: whereClause,
            transaction,
        });
        if (!application) {
            throw new NotFoundError("Application not found");
        }
        return application;
    }

    async _update(whereClause, updates, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const application = await this._find(whereClause, tx);
                await application.update(updates, { transaction: tx });
                await tx.commit();
                return application;
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(`Error updating application: ${error.message}`);
            }
        }, transaction);
    }

    async _delete(whereClause, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const deleted = await Application.destroy({
                    where: whereClause,
                    transaction: tx,
                });
                if (deleted === 0) {
                    throw new NotFoundError("Application not found");
                }
                await tx.commit();
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(`Error deleting application: ${error.message}`);
            }
        }, transaction);
    }

    // Public methods that use the generalized functions

    /**
     * Create a new application within a transaction.
     * @param {object} data - The data of the application to be created.
     * @returns {Promise<Application>} - A promise that resolves to the created application.
     * @throws {Error} - If there is an error during the creation process.
     */
    async create(data) {
        return await sequelize.transaction(async (transaction) => {
            try {
                return await Application.create(data, { transaction });
            } catch (error) {
                console.error(error);
                throw new Error(`Error creating application: ${error.message}`);
            }
        });
    }

    /**
     * Find an application by its token
     * @param {string} token - The unique token of the application
     * @returns {Promise<Application|null>} - The application if found, or null otherwise
     */
    async findByToken(token) {
        try {
            return await this._find({ token });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Find an application by its Id
     * @param {number} id - The unique id of the application
     * @returns {Promise<Application|null>} - The application if found, or null otherwise
     */
    async findById(id) {
        try {
            return await this._find({ id });
        } catch (error) {
            throw new Error(error.message);
        }
    }
    /**
     * Retrieves all applications that match the filter parameters.
     * @param {Object} filterParams - The filter parameters to be used in the query.
     * @returns {Promise<Application[]>} - A promise that resolves to an array of applications.
     * @throws {Error} - If there is an error during the operation.
     */
    async findAll(filterParams) {
        try {
            return await Application.findAll(
                filterParamsToSQL(filterParams, this._allowedSortingFields)
            );
        } catch (error) {
            throw new Error(`Error fetching applications: ${error.message}`);
        }
    }

    /**
     * Retrieves all applications with the count of applications that match the filter parameters.
     * @param {Object} filterParams - The filter parameters to be used in the query.
     * @returns {Promise<{count: number, rows: Application[]}>} - A promise that resolves to an object with the count of applications and the list of applications.
     * @throws {Error} - If there is an error during the operation.
     */
    async findAllWithCount(filterParams) {
        try {
            const { limit, offset, order, ...rest } = filterParamsToSQL(
                filterParams,
                this._allowedSortingFields
            );

            const count = await Application.count({
                where: rest,
            });

            const rows = await Application.findAll({
                limit,
                offset,
                order,
                where: rest,
            });

            return { count, rows };
        } catch (error) {
            throw new Error(
                `Error fetching applications with count: ${error.message}`
            );
        }
    }

    /**
     * Updates an application by its token
     * @param {string} token - The unique token of the application to be updated
     * @param {Object} updates - The updates to be applied to the application
     * @param {Transaction} [transaction] - The transaction to use (optional)
     * @returns {Promise<Application>} - The updated application
     * @throws {NotFoundError} - If the application is not found
     * @throws {Error} - If there is an error during the operation
     */
    async updateByToken(token, updates, transaction = null) {
        return this._update({ token }, updates, transaction);
    }

    /**
     * Updates an application by its Id
     * @param {number} id - The unique id of the application to be updated
     * @param {Object} updates - The updates to be applied to the application
     * @param {Transaction} [transaction] - The transaction to use (optional)
     * @returns {Promise<Application>} - The updated application
     * @throws {NotFoundError} - If the application is not found
     * @throws {Error} - If there is an error during the operation
     */
    async updateById(id, updates, transaction = null) {
        return this._update({ id }, updates, transaction);
    }

    /**
     * Updates the chats count of an application.
     * @param {string} token - The unique token of the application.
     * @param {number} count - The new value of the chats count.
     * @param {Transaction} [transaction] - The transaction to use (optional). If not provided, a new one will be created.
     * @returns {Promise<Application>} - The updated application.
     * @throws {NotFoundError} - If the application is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async updateChatsCount(token, count, transaction = null) {
        return this._update({ token }, { chats_count: count }, transaction);
    }

    /**
     * Increments the chats count of an application.
     * @param {string} token - The unique token of the application.
     * @param {number} [incrementBy=1] - The value to increment the chats count by.
     * @param {Transaction} [transaction] - The transaction to use (optional). If not provided, a new one will be created.
     * @returns {Promise<Application>} - The updated application.
     * @throws {NotFoundError} - If the application is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async incrementChatsCount(token, incrementBy = 1, transaction = null) {
        console.log(
            `Incrementing chats_count for token: ${token} by ${incrementBy}`
        );

        return this._update(
            { token },
            { chats_count: sequelize.literal(`chats_count + ${incrementBy}`) },
            transaction
        );
    }
    /**
     * Decrements the chats count of an application.
     * @param {string} token - The unique token of the application.
     * @param {number} [decrementBy=1] - The value to decrement the chats count by.
     * @param {Transaction} [transaction] - The transaction to use (optional). If not provided, a new one will be created.
     * @returns {Promise<Application>} - The updated application.
     * @throws {NotFoundError} - If the application is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async decrementChatsCount(token, decrementBy = 1, transaction = null) {
        return this._update(
            { token },
            { chats_count: sequelize.literal(`chats_count - ${decrementBy}`) },
            transaction
        );
    }

    /**
     * Deletes an application by its token
     * @param {string} token - The unique token of the application to be deleted
     * @param {Transaction} [transaction] - The transaction to use (optional)
     * @returns {Promise<void>} - A promise that resolves when the application is deleted
     * @throws {NotFoundError} - If the application is not found
     * @throws {Error} - If there is an error during the operation
     */
    async deleteByToken(token, transaction = null) {
        return this._delete({ token }, transaction);
    }

    /**
     * Deletes an application by its Id
     * @param {number} id - The unique id of the application to be deleted
     * @param {Transaction} [transaction] - The transaction to use (optional)
     * @returns {Promise<void>} - A promise that resolves when the application is deleted
     * @throws {NotFoundError} - If the application is not found
     * @throws {Error} - If there is an error during the operation
     */
    async deleteById(id, transaction = null) {
        return this._delete({ id }, transaction);
    }
}

module.exports = new ApplicationRepository();
