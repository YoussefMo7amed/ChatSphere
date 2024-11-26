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
            console.error(error);
            errorResponse(res, error.message, error.statusCode ?? 400);
        }
    }

    /**
     * Get a chat by its number
     * @param {Request} req
     * @param {Response} res
     */
    async getChat(req, res) {
        try {
            const { token, number } = req.params;
            const chat = await chatService.getChat(token, number);
            successResponse(res, chat, 200);
        } catch (error) {
            console.error(error);
            errorResponse(res, error.message, error.statusCode ?? 404);
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
            const { data, ...meta } = await chatService.getAllChats(token, {
                page,
                limit,
            });
            successResponse(res, data, 200, meta);
        } catch (error) {
            console.error(error);
            errorResponse(res, error.message, error.statusCode ?? 404);
        }
    }

    /**
     * Delete a chat by its number
     * @param {Request} req
     * @param {Response} res
     */
    async delete(req, res) {
        try {
            const { token, number } = req.params;
            await chatService.deleteChat(token, number);
            successResponse(res, "Chat deleted", 204);
        } catch (error) {
            console.error(error);
            errorResponse(res, error.message, error.statusCode ?? 404);
        }
    }
}

module.exports = new ChatController();
