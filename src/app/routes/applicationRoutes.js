const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

/**
 * @swagger
 * tags:
 *   - name: applications
 *     description: Manage applications
 */

/**
 * @swagger
 * /applications:
 *   post:
 *     tags: [applications]
 *     summary: Create a new application
 *     description: Create a new application and return the name and token of the application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 token:
 *                   type: string
 *   get:
 *     tags: [applications]
 *     summary: Get all applications
 *     description: Get all applications
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       token:
 *                         type: string
 *                       chats_count:
 *                         type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pageNumber:
 *                       type: integer
 *                     limitNumber:
 *                       type: integer
 *                     startIndex:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     next:
 *                       type: string
 */

/**
 * @swagger
 * /applications/{token}:
 *   get:
 *     tags: [applications]
 *     summary: Get an application by token
 *     description: Get an application by its token
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 token:
 *                   type: string
 *       404:
 *         description: Not Found
 *   put:
 *     tags: [applications]
 *     summary: Update an application
 *     description: Update an application
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The token of the application
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 token:
 *                   type: string
 *       404:
 *         description: Not Found
 *   delete:
 *     tags: [applications]
 *     summary: Delete an application
 *     description: Delete an application
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
 *       404:
 *         description: Not Found
 */

router.post("/", applicationController.create);
router.get("/", applicationController.getAll);
router.get("/:token", applicationController.getOne);
router.put("/:token", applicationController.update);
router.delete("/:token", applicationController.delete);

module.exports = router;
