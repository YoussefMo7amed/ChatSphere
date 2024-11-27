const messageService = require("../services/messageService");
const {
    successResponse,
    errorResponse,
} = require("../../utils/responseHelper");

class MessageController {
    /**
     * Add a message to a chat
     * @param {Request} req
     * @param {Response} res
     */
    async create(req, res) {
        try {
            const { token, number } = req.params;
            const { body } = req.body;
            const message = await messageService.createMessage(
                token,
                number,
                body
            );
            successResponse(res, message, 201);
        } catch (error) {
            console.error(error);
            errorResponse(res, error.message, 400);
        }
    }

    /**
     * Get all messages for a chat
     * @param {Request} req
     * @param {Response} res
     */
    async getMessages(req, res) {
        try {
            const { token, number } = req.params;
            const { data, ...meta } = await messageService.getAllMessages(
                token,
                number,
                req.query
            );
            successResponse(res, data, 200, meta);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    /**
     * Search messages within a chat
     * @param {Request} req
     * @param {Response} res
     */
    async searchMessages(req, res) {
        try {
            const { token, number } = req.params;
            const { query } = req.query;
            const { data, ...meta } = await messageService.searchMessages(
                token,
                number,
                query,
                req.query
            );
            successResponse(res, data, 200, meta ?? null);
        } catch (error) {
            console.error(error);
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new MessageController();
