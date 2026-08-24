const express = require('express');
const router = express.Router();
const SavedJobController = require('../controllers/savedJobController');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Saved Jobs
 *   description: Bookmark jobs for later (authenticated users)
 */

/**
 * @swagger
 * /api/saved:
 *   get:
 *     summary: Get saved jobs
 *     description: Returns all jobs saved by the current user, with full job details joined from unified_jobs.
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       job_id: { type: integer }
 *                       job_source: { type: string, enum: [wld, dj] }
 *                       saved_at: { type: string, format: date-time }
 *                       title: { type: string }
 *                       company_name: { type: string }
 *                       contract_type: { type: string }
 *                       remote_type: { type: string }
 *                       salary_min: { type: integer }
 *                       salary_max: { type: integer }
 *                       currency: { type: string }
 *                       skills: { type: string }
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, SavedJobController.getSavedJobs);

/**
 * @swagger
 * /api/saved/ids:
 *   get:
 *     summary: Get saved job IDs
 *     description: Returns a flat array of job_id integers for the current user (useful for UI heart-toggle state).
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of job IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2, 3]
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.get('/ids', authenticateToken, SavedJobController.getSavedIds);

/**
 * @swagger
 * /api/saved:
 *   post:
 *     summary: Save a job
 *     description: Bookmarks a job for the authenticated user.
 *     tags: [Saved Jobs]
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
 *                 example: 1
 *               job_source:
 *                 type: string
 *                 enum: [wld, dj]
 *                 example: wld
 *     responses:
 *       201:
 *         description: Job saved
 *       400:
 *         description: Missing job_id or job_source
 *       409:
 *         description: Job already saved
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, SavedJobController.saveJob);

/**
 * @swagger
 * /api/saved/{job_id}:
 *   delete:
 *     summary: Unsave / remove a job
 *     description: Removes a saved job bookmark for the authenticated user.
 *     tags: [Saved Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to unsave
 *     responses:
 *       200:
 *         description: Job removed from saved
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.delete('/:job_id', authenticateToken, SavedJobController.unsaveJob);

module.exports = router;
