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
 *   post:
 *     summary: Create a new    chat
 *     tags: [chats]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The token of the application
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     summary: Get all chats for an application
 *     tags: [chats]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The token of the application
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ok
 */
router.post("/", chatController.create);
router.get("/", chatController.getChats);

module.exports = router;
