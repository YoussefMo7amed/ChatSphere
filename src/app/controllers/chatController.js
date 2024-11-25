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
            errorResponse(res, error.message, error.statusCode ?? 400);
        }
    }

    /**
     * Get all chats for an application
     * @param {Request} req
     * @param {Response} res
     */
    async getChats(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const { token } = req.params;
            const { data, ...meta } = await chatService.getChats(token, {
                page,
                limit,
            });
            successResponse(res, data, 200, meta);
        } catch (error) {
            errorResponse(res, error.message, error.statusCode ?? 400);
        }
    }
}

module.exports = new ChatController();
