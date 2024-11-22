const { Chat } = require("../models");
const applicationRepository = require("./applicationRepository");

class ChatRepository {
    /**
     * Create a new chat
     * @param {object} data - The data of the chat to be created
     * @returns {Promise<object>} - The created chat
     */
    async create(data) {
        try {
            return await Chat.create(data);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Retrieve all chats for a specific application
     * @param {number} application_id - The ID of the application
     * @returns {Promise<Array>} - A promise that resolves to an array of chats
     */
    async findAllByApplication(application_id) {
        try {
            return await Chat.findAll({ where: { application_id } });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Find a chat by its number and application ID
     * @param {number} number - The number of the chat
     * @param {number} application_id - The ID of the application
     * @returns {Promise<Chat|null>} - The found chat or null if no chat is found
     */
    async findByNumberAndApplicationId(number, application_id) {
        try {
            return await Chat.findOne({ where: { number, application_id } });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async findByNumberAndApplicationToken(number, application_token) {
        try {
            const application = await applicationRepository.findByToken(
                application_token
            );
            return await Chat.findOne({
                where: { number, application_id: application.id },
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }
    /**
     * Increment the messages count of a chat
     * @param {number} chat_id - The ID of the chat
     * @returns {Promise<Chat>} - The updated chat
     */
    async incrementMessagesCount(chat_id) {
        try {
            return await Chat.increment("messages_count", {
                where: { id: chat_id },
            });
        } catch (error) {
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
            throw new Error(error.message);
        }
    }
    // TODO:
    //handle cascade deletion
    //handle race condition
}

module.exports = new ChatRepository();
