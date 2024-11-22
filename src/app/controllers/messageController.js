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
            const { token, chatNumber } = req.params; // Application token and chat number
            const { body } = req.body; // Message body
            const message = await messageService.createMessage(
                token,
                chatNumber,
                body
            );
            successResponse(res, message, 201);
        } catch (error) {
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
            const { token, chatNumber } = req.params; // Application token and chat number
            const messages = await messageService.getMessages(
                token,
                chatNumber
            );
            successResponse(res, messages, 200);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new MessageController();
