const { Message, sequelize, Chat } = require("../models");
const { filterParamsToSQL, NotFoundError } = require("../../utils/shared");

class MessageRepository {
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

    // /**
    //  * Create a new message in the database
    //  * @param {object} data - The data of the message to be created
    //  * @returns {Promise<object>} - The created message
    //  */
    // async create(data) {
    //     try {
    //         return await Message.create(data);
    //     } catch (error) {
    //         throw new Error(error.message);
    //     }
    // }
    /**
     * Inserts multiple messages into the database in a single operation.
     * @param {Array<object>} messages - An array of message objects to be inserted.
     * @param {Transaction} [transaction] - The transaction to use for the operation (optional).
     * @returns {Promise<Array<object>>} - The inserted messages.
     * @throws {Error} - If there is an error during the operation.
     */
    async createBulk(messages, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const insertedMessages = await Chat.bulkCreate(messages, {
                    transaction: tx,
                });
                await tx.commit();
                return insertedMessages;
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(
                    `Error creating bulk messages: ${error.message}`
                );
            }
        }, transaction);
    }

    /**
     * Create multiple new messages in the database
     * @param {array} messages - The messages to be created
     * @returns {Promise<Array>} - The created messages
     */
    async createMany(messages) {
        try {
            return await Message.bulkCreate(messages);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async create(data, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const createdMessage = await Message.create(data, {
                    transaction: tx,
                });
                await tx.commit();
                return createdMessage;
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(`Error creating message: ${error.message}`);
            }
        }, transaction);
    }

    /**
     * Retrieves all messages for a specific chat ID with the given filter parameters.
     * @param {number|string} chatId - The ID of the chat.
     * @param {object} filterParams - The filter parameters for the query.
     * @returns {Promise<Array>} - A promise that resolves to an array of messages.
     * @throws {Error} - If there is an error fetching the messages.
     */
    async findAllByChatId(chatId, filterParams) {
        try {
            filterParams.chat_id = chatId;
            const { limit, offset, order, ...rest } = filterParamsToSQL(
                filterParams,
                this._allowedSortingFields
            );
            const count = await Message.count({
                where: { ...rest },
            });
            const rows = await Message.findAll({
                limit,
                offset,
                order,
                where: rest,
            });
            return { count, rows };
        } catch (error) {
            throw new Error(`Error fetching applications: ${error.message}`);
        }
    }

    /**
     * Finds a specific message by its number and chat ID.
     * @param {number|string} number - The number of the message.
     * @param {number|string} chatId - The ID of the chat.
     * @param {Transaction} [transaction] - The transaction to use for the query (optional).
     * @returns {Promise<object>} - The found message.
     * @throws {NotFoundError} - If the message is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async findByNumberAndChatId(number, chatId, transaction = null) {
        return this._performTransaction(async (tx) => {
            const message = await Chat.findOne({
                where: { number, chatId },
                transaction: tx,
            });
            if (!message) {
                throw new NotFoundError(
                    `Message not found with number: ${number} and chatId: ${chatId}`
                );
            }
            await tx.commit();
            return message;
        }, transaction);
    }

    /**
     * Counts the number of messages in a specific chat.
     * @param {number|string} chatId - The ID of the chat.
     * @param {Transaction} [transaction] - The transaction to use for the query (optional).
     * @returns {Promise<number>} - The count of messages.
     * @throws {Error} - If there is an error during the operation.
     */
    async count(chatId, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const messageCount = await Chat.count({
                    where: { chatId },
                    transaction: tx,
                });
                await tx.commit();
                return messageCount;
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(
                    `Error counting messages in chat: ${error.message}`
                );
            }
        }, transaction);
    }

    /**
     * Updates the message count of a specific chat.
     * @param {number|string} chatId - The ID of the chat.
     * @param {number} newCount - The new message count to set.
     * @param {Transaction} [transaction] - The transaction to use for the operation (optional).
     * @returns {Promise<object>} - The updated chat with the new message count.
     * @throws {NotFoundError} - If the chat is not found.
     * @throws {Error} - If there is an error during the operation.
     */
    async updateMessageCount(chatId, newCount, transaction = null) {
        return this._performTransaction(async (tx) => {
            try {
                const chat = await this._find({ id: chatId }, tx);
                await chat.update(
                    { messageCount: newCount },
                    { transaction: tx }
                );
                await tx.commit();
                return chat;
            } catch (error) {
                await tx.rollback();
                console.error(error);
                throw new Error(
                    `Error updating message count: ${error.message}`
                );
            }
        }, transaction);
    }
}

module.exports = new MessageRepository();
