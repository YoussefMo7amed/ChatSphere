const { Chat } = require("../models");
const applicationRepository = require("./applicationRepository");
const { filterParamsToSQL, NotFoundError } = require("../../utils/shared");

class ChatRepository {
    _allowedSortingFields = ["created_at", "number"];

    async _performTransaction(operation, transaction = null) {
        const tx = transaction || (await sequelize.transaction());
        return operation(tx);
    }

    /**
     * Finds a chat by its where clause.
     * @param {object} whereClause - The conditions to find the chat.
     * @param {Transaction} [transaction] - The transaction to use for the query (optional).
     * @returns {Promise<object>} - The found chat.
     * @throws {NotFoundError} - If the chat is not found.
     */
    async _find(whereClause, transaction = null) {
        const chat = await Chat.findOne({
            where: whereClause,
            transaction,
        });
        if (!chat) {
            throw new NotFoundError("Chat not found");
        }
        return chat;
    }

    /**
     * Updates a chat based on the specified where clause and updates.
     * @param {object} whereClause - The conditions to find the chat.
     * @param {object} updates - The changes to apply to the chat.
     * @param {Transaction} [transaction] - The transaction to use for the query.
     * @returns {Promise<object>} - The updated chat.
     * @throws {NotFoundError} - If the chat is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async _update(whereClause, updates, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const chat = await this._find(whereClause, tx);
                await chat.update(updates, { transaction: tx });
                await tx.commit();
                return chat;
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(`Error updating chat: ${error.message}`);
            }
        }, transaction);
    }

    /**
     * Deletes a chat based on the specified where clause.
     * @param {object} whereClause - The conditions to find and delete the chat.
     * @param {Transaction} [transaction] - The transaction to use for the operation (optional).
     * @returns {Promise<void>} - A promise that resolves when the chat is deleted.
     * @throws {NotFoundError} - If the chat is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async _delete(whereClause, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const deleted = await Chat.destroy({
                    where: whereClause,
                    transaction: tx,
                });
                if (deleted === 0) {
                    throw new NotFoundError("Chat not found");
                }
                await tx.commit();
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(`Error deleting chat: ${error.message}`);
            }
        }, transaction);
    }

    /**
     * Creates a new chat for an application.
     * @param {object} data - The data to create the chat with.
     * @param {Transaction} [transaction] - The transaction to use for the query (optional).
     * @returns {Promise<Chat>} - A promise that resolves to the created chat.
     * @throws {Error} - If there is an error during the operation.
     */
    async create(data, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const maxNumber = await Chat.max("number", {
                    where: { application_id: data.application_id },
                    transaction: tx,
                });
                const nextNumber = (maxNumber || 0) + 1;
                data.number = nextNumber;
                return await Chat.create(data, { transaction: tx });
            } catch (error) {
                console.error(error);
                throw new Error(`Error creating application: ${error.message}`);
            }
        }, transaction);
    }

    /**
     * Finds a chat by its ID.
     * @param {number} id - The ID of the chat.
     * @param {Transaction} [transaction] - The transaction to use for the query (optional).
     * @returns {Promise<Chat|null>} - A promise that resolves to the found chat or null if no chat is found.
     */
    async findById(id, transaction = null) {
        try {
            return await this._find({
                where: { id },
                transaction,
            });
        } catch (error) {
            console.error(error);
            throw new Error(`Error finding chat by id: ${error.message}`);
        }
    }

    /**
     * Retrieves all chats for a specific application
     * @param {number} application_id - The ID of the application
     * @param {object} filterParams - The filter parameters for the query
     * @returns {Promise<Chat[]>} - A promise that resolves to the list of chats
     */
    async findAllByApplicationId(application_id, filterParams) {
        try {
            const { limit, offset, order, ...rest } = filterParamsToSQL(
                filterParams,
                this._allowedSortingFields
            );

            const count = await Chat.count({
                where: { ...rest, application_id },
            });

            const rows = await Chat.findAll({
                limit,
                offset,
                order,
                where: { ...rest, application_id },
            });

            return { count, rows };
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * Find a chat by its number and application ID
     * @param {number} number - The number of the chat
     * @param {number} application_id - The ID of the application
     * @returns {Promise<Chat|null>} - The found chat or null if no chat is found
     */
    async findByNumberAndApplicationId(number, application_id, filterParams) {
        try {
            return await this._find({ application_id, number });
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * Find a chat by its number and application token
     * @param {number} number - The number of the chat
     * @param {string} application_token - The token of the application
     * @returns {Promise<Chat|null>} - The found chat or null if no chat is found
     */
    async findByNumberAndApplicationToken(number, application_token) {
        try {
            const application = await applicationRepository.findByToken(
                application_token
            );
            return await this.findAllByApplicationId(number, application.id);
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * Increment the messages count for a chat
     * @param {number} chat_id - The ID of the chat
     * @param {Transaction} [transaction] - The transaction to use (optional). If not provided, a new one will be created.
     * @returns {Promise<Chat>} - The updated chat
     * @throws {Error} - If there is an error during the operation.
     */
    async incrementMessagesCount(chat_id, transaction = null) {
        try {
            return await this._update(
                { id: chat_id },
                { messages_count: sequelize.literal("messages_count + 1") },
                transaction
            );
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * Decrement the messages count for a chat
     * @param {number} chat_id - The ID of the chat
     * @param {Transaction} [transaction] - The transaction to use (optional). If not provided, a new one will be created.
     * @returns {Promise<Chat>} - The updated chat
     * @throws {Error} - If there is an error during the operation.
     */
    async decrementMessagesCount(chat_id, transaction = null) {
        try {
            return await this._update(
                { id: chat_id },
                { messages_count: sequelize.literal("messages_count - 1") },
                transaction
            );
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * Count the total number of chats in the database
     * @returns {Promise<number>} - A promise that resolves to the total chat count
     */
    async count() {
        try {
            return await Chat.count();
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * Update the messages count of a chat
     * @param {number} chat_id - The ID of the chat
     * @param {number} messages_count - The new messages count
     * @returns {Promise<Chat>} - The updated chat
     */
    async updateMessagesCount(chat_id, messages_count) {
        try {
            return await this._update({ id: chat_id }, { messages_count });
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    /**
     * Deletes a chat by its ID.
     * @param {number} chat_id - The ID of the chat to be deleted.
     * @param {Transaction} [transaction] - The transaction to use for the query (optional).
     * @returns {Promise<void>} - A promise that resolves when the chat is deleted.
     * @throws {NotFoundError} - If the chat is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async deleteById(chat_id, transaction = null) {
        try {
            await this._delete({ id: chat_id }, transaction);
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }
}

module.exports = new ChatRepository();
