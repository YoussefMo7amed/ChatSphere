const express = require("express");
const router = express.Router({ mergeParams: true }); // Merge :token from parent
const chatController = require("../controllers/chatController");
/**
 * @swagger
 * tags:
 *   - name: chats
 *     description: Manage chats
 */

/**
 * @swagger
 * /applications/{token}/chats:
 *   parameters:
 *     - $ref: '#/components/parameters/TokenParameter'
 *   post:
 *     summary: Create a new chat
 *     tags: [chats]
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     summary: Get all chats for an application
 *     tags: [chats]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *         description: The page number to be retrieved
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *         description: The number of items per page
 *     responses:
 *       200:
 *         description: Ok
 */

/**
 * @swagger
 * /applications/{token}/chats/{number}:
 *   get:
 *     summary: Get a chat
 *     tags: [chats]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The token of the application
 *         schema:
 *           type: string
 *       - in: path
 *         name: number
 *         required: true
 *         description: The number of the chat
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ok
 *   delete:
 *     summary: Delete a chat
 *     tags: [chats]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The token of the application
 *         schema:
 *           type: string
 *       - in: path
 *         name: number
 *         required: true
 *         description: The number of the chat to be deleted
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Not Found
 */

router.post("/", chatController.create);
router.get("/", chatController.getChats);
router.get("/:number", chatController.getChat);
router.delete("/:number", chatController.delete);

module.exports = router;
