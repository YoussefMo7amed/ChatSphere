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

router.post("/", chatController.create);
router.get("/", chatController.getChats);

module.exports = router;
