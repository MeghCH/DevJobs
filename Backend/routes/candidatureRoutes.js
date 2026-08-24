const express = require('express');
const router = express.Router();
const CandidatureController = require('../controllers/candidatureController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management for authenticated users
 */

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get my applications
 *     description: Returns all jobs the current user has applied to, with job details joined from unified_jobs.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's applications
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
 *                       applied_at: { type: string, format: date-time }
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
router.get('/', authenticateToken, CandidatureController.getMyApplications);

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get a specific application by ID
 *     description: Returns a single application belonging to the current user.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *       404:
 *         description: Application not found
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Get all applications for a specific job (recruiter only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of candidates who applied to this job
 *       403:
 *         description: Job does not belong to your company
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.get('/job/:jobId', authenticateToken, authorizeRoles('recruiter', 'admin'), CandidatureController.getApplicationsByJob);

router.get('/:id', authenticateToken, CandidatureController.getApplicationById);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply to a job
 *     description: Submits a new application for the authenticated user.
 *     tags: [Applications]
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
 *         description: Application submitted
 *       400:
 *         description: Missing job_id or job_source
 *       409:
 *         description: Already applied to this job
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'cover_letter', maxCount: 1 },
    { name: 'extra_documents', maxCount: 1 },
]), CandidatureController.apply);

/**
 * @swagger
 * /api/applications/{id}:
 *   patch:
 *     summary: Update application status (recruiter/admin only)
 *     description: Allows a recruiter to accept or reject a candidate's application. Recruiters can only update applications for jobs belonging to their company.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
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
 *                 enum: [pending, accepted, rejected]
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Application not found or not authorized
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.patch('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), CandidatureController.updateApplicationStatus);
router.delete('/:id', authenticateToken, CandidatureController.deleteApplication);

module.exports = router;
