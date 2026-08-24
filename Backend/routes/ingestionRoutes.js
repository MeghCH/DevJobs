const express = require('express');
const router = express.Router();
const IngestionController = require('../controllers/ingestionController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ingestion
 *   description: External data ingestion endpoints
 */

/**
 * @swagger
 * /api/ingest:
 *   post:
 *     summary: Trigger WeLoveDevs data ingestion
 *     description: |
 *       Fetches job offers from the WeLoveDevs API, normalizes them,
 *       and inserts them into the `jobs_wld` table.
 *       Only **admin** users can trigger this endpoint.
 *     tags: [Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ingestion completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Ingestion completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     inserted:
 *                       type: integer
 *                       description: Number of new offers inserted
 *                     skipped:
 *                       type: integer
 *                       description: Number of offers already present (duplicates)
 *                     errors:
 *                       type: integer
 *                       description: Number of errors encountered
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden — requires admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: WLD_API_KEY missing or ingestion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    IngestionController.trigger
);

module.exports = router;
