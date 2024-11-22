const chatRepository = require("../repositories/chatRepository");
const applicationRepository = require("../repositories/applicationRepository");
// todo , create pagination, update the swagger

class ChatService {
    /**
     * Create a new chat for an application
     * @param {string} applicationToken - The token of the application
     * @returns {Promise<object>} - The created chat
     */
    async createChat(applicationToken) {
        // Find the application by its token
        const application = await applicationRepository.findByToken(
            applicationToken
        );
        if (!application) {
            throw new Error("Application not found");
        }

        // handle
        const nextChatNumber = application.chats_count + 1;

        // Create the chat
        const chat = await chatRepository.create({
            number: nextChatNumber,
            application_id: application.id,
            messages_count: 0,
        });

        // Increment the chat count for the application
        await applicationRepository.updateByToken(applicationToken, {
            chats_count: nextChatNumber,
        });

        return chat;
    }

    /**
     * Get all chats for an application
     * @param {string} applicationToken - The token of the application
     * @returns {Promise<Array>} - The list of chats
     */
    async getChats(applicationToken) {
        // Find the application by its token
        const application = await applicationRepository.findByToken(
            applicationToken
        );
        if (!application) {
            throw new Error("Application not found");
        }

        // Fetch all chats for the application
        return await chatRepository.findAllByApplication(application.id);
    }

    /**
     * Get a chat by its number and application token
     * @param {string} applicationToken - The token of the application
     * @param {number} chatNumber - The number of the chat
     * @returns {Promise<object>} - The chat
     */
    async getChat(applicationToken, chatNumber) {
        // Find the application by its token
        const application = await applicationRepository.findByToken(
            applicationToken
        );
        if (!application) {
            throw new Error("Application not found");
        }

        // Fetch the chat by its number and application ID
        return await chatRepository.findByNumberAndApplicationId(
            chatNumber,
            application.id
        );
    }
}

module.exports = new ChatService();
