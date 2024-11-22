const chatService = require("../services/chatService");
const {
    successResponse,
    errorResponse,
} = require("../../utils/responseHelper");

class ChatController {
    /**
     * Create a new chat for an application
     * @param {Request} req
     * @param {Response} res
     */
    async create(req, res) {
        try {
            const { token } = req.params;
            const chat = await chatService.createChat(token);
            successResponse(res, chat, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    /**
     * Get all chats for an application
     * @param {Request} req
     * @param {Response} res
     */
    async getChats(req, res) {
        try {
            const { token } = req.params;
            const chats = await chatService.getChats(token);
            successResponse(res, chats, 200);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new ChatController();
