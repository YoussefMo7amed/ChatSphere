const { Message } = require("../models");

class MessageRepository {
    /**
     * Create a new message in the database
     * @param {object} data - The data of the message to be created
     * @returns {Promise<object>} - The created message
     */
    async create(data) {
        try {
            return await Message.create(data);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Retrieve all messages for a specific chat
     * @param {number} chat_id - The ID of the chat
     * @returns {Promise<Array>} - A promise that resolves to an array of messages ordered by their number
     */
    async findAllByChat(chat_id) {
        try {
            return await Message.findAll({
                where: { chat_id },
                order: [["number", "ASC"]],
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Find a message by its number and chat
     * @param {number} number - The number of the message
     * @param {number} chat_id - The ID of the chat
     * @returns {Promise<object|null>} - The found message or null if no message is found
     */
    async findByNumberAndChat(number, chat_id) {
        try {
            return await Message.findOne({ where: { number, chat_id } });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Count the total number of messages in the database
     * @returns {Promise<number>} - A promise that resolves to the total message count
     */
    async count() {
        try {
            return await Message.count();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new MessageRepository();
