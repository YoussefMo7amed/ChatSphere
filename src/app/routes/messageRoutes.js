const express = require("express");
const router = express.Router({ mergeParams: true }); // Merge :token and :chatNumber from parent
const messageController = require("../controllers/messageController");

/**
 * @swagger
 * tags:
 *   - name: messages
 *     description: Manage messages
 */

/**
 * @swagger
 * /applications/{token}/chats/{chatNumber}/messages:
 *   post:
 *     tags: [messages]
 *     summary: Add a message to a chat
 *     description: Add a message to a chat
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The token of the application
 *         schema:
 *           type: string
 *       - in: path
 *         name: chatNumber
 *         required: true
 *         description: The number of the chat
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 number:
 *                   type: integer
 *                 token:
 *                   type: string
 *                 body:
 *                   type: string
 *   get:
 *     tags: [messages]
 *     summary: Get all messages for a chat
 *     description: Get all messages for a chat
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The token of the application
 *         schema:
 *           type: string
 *       - in: path
 *         name: chatNumber
 *         required: true
 *         description: The number of the chat
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   number:
 *                     type: integer
 *                   token:
 *                     type: string
 *                   body:
 *                     type: string
 */

router.post("/", messageController.create);
router.get("/", messageController.getMessages);

module.exports = router;
