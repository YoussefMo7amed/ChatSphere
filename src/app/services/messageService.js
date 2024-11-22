const applicationRepository = require("../repositories/applicationRepository");
const chatRepository = require("../repositories/chatRepository");
const messageRepository = require("../repositories/messageRepository");

// todo , create pagination, update the swagger

class MessageService {
    /**
     * Add a message to a chat
     * @param {string} applicationToken - The token of the application
     * @param {number} chatNumber - The number of the chat
     * @param {string} body - The content of the message
     * @returns {Promise<object>} - The created message
     */
    async createMessage(applicationToken, chatNumber, body) {
        const application = await applicationRepository.findByToken(
            applicationToken
        );
        const chat = await chatRepository.findByNumberAndApplicationId(
            chatNumber,
            application.id
        );
        if (!chat) {
            throw new Error("Chat not found");
        }

        // todo : auto increment
        // Determine the next message number for this chat
        const nextMessageNumber = chat.messages_count + 1;

        // Create the message
        const message = await messageRepository.create({
            number: nextMessageNumber,
            body,
            chat_id: chat.id,
            application_id: application.id,
        });

        // Increment the messages count for the chat
        await chatRepository.incrementMessagesCount(chat.id);

        return message;
    }

    /**
     * Get all messages for a chat
     * @param {string} applicationToken - The token of the application
     * @param {number} chatNumber - The number of the chat
     * @returns {Promise<Array>} - The list of messages
     */
    async getMessages(applicationToken, chatNumber) {
        // Find the chat using the application token and chat number
        const chat = await chatRepository.findByNumberAndApplicationToken(
            chatNumber,
            applicationToken
        );
        if (!chat) {
            throw new Error("Chat not found");
        }

        // Fetch all messages for the chat
        return await messageRepository.findAllByChat(chat.id);
    }
}

module.exports = new MessageService();
