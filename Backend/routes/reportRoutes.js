const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Job offer reporting for moderation
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Report a job offer
 *     description: Allows an authenticated user to report a job offer for moderation.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [job_id, job_source]
 *             properties:
 *               job_id:
 *                 type: integer
 *                 example: 42
 *               job_source:
 *                 type: string
 *                 enum: [wld, dj]
 *                 example: wld
 *               reason:
 *                 type: string
 *                 example: "This offer seems fraudulent."
 *     responses:
 *       201:
 *         description: Job reported successfully
 *       400:
 *         description: Missing required fields or invalid source
 *       401:
 *         description: No token provided
 *       404:
 *         description: Job not found
 *       409:
 *         description: Already reported by this user
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, ReportController.create);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reported jobs
 *     description: Returns all reports with job and reporter details. Admin only.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reported jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: No token provided
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, authorizeRoles('admin'), ReportController.getAll);

/**
 * @swagger
 * /api/reports/{id}:
 *   patch:
 *     summary: Update report status
 *     description: Admin can update the status of a report (open, reviewed, resolved, dismissed).
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, reviewed, resolved, dismissed]
 *                 example: resolved
 *     responses:
 *       200:
 *         description: Report status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: No token provided
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', authenticateToken, authorizeRoles('admin'), ReportController.updateStatus);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     description: Admin can delete a report.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report deleted
 *       401:
 *         description: No token provided
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), ReportController.delete);

module.exports = router;
