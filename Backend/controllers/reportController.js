const pool = require('../config/db');

/**
 * @description Report Controller
 * Handles job offer reporting (users flag suspicious or fake jobs)
 */
const ReportController = {
    /**
     * @route POST /api/reports
     * @desc Report a job offer
     * @access Private (authenticated users)
     */
    async create(req, res) {
        try {
            const { job_id, job_source, reason } = req.body;
            const userId = req.user.userId;

            if (!job_id || !job_source) {
                return res.status(400).json({
                    success: false,
                    message: 'job_id and job_source are required'
                });
            }

            if (!['wld', 'dj'].includes(job_source)) {
                return res.status(400).json({
                    success: false,
                    message: 'job_source must be "wld" or "dj"'
                });
            }

            // Verify job exists
            const jobTable = job_source === 'wld' ? 'jobs_wld' : 'jobs_dj';
            const [jobs] = await pool.query(
                `SELECT id FROM ${jobTable} WHERE id = ?`,
                [job_id]
            );
            if (jobs.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            await pool.query(
                `INSERT INTO reported_jobs (job_id, job_source, user_id, reason, status)
                 VALUES (?, ?, ?, ?, ?)`,
                [job_id, job_source, userId, reason || null, 'open']
            );

            return res.status(201).json({
                success: true,
                message: 'Job reported successfully'
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'You have already reported this job'
                });
            }
            console.error('Report creation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error reporting job'
            });
        }
    },

    /**
     * @route GET /api/reports
     * @desc Get all reported jobs (admin only)
     * @access Private (Admin)
     */
    async getAll(req, res) {
        try {
            const [rows] = await pool.query(
                `SELECT
                    r.id AS report_id,
                    r.job_id,
                    r.job_source,
                    r.reason,
                    r.status AS report_status,
                    r.reported_at,
                    r.resolved_at,
                    j.title AS job_title,
                    j.company_name,
                    j.contract_type,
                    j.location,
                    j.status AS job_status,
                    u.id AS reporter_id,
                    CONCAT(u.firstname, ' ', u.name) AS reporter_name,
                    u.email AS reporter_email
                 FROM reported_jobs r
                 LEFT JOIN unified_jobs j ON r.job_id = j.id AND r.job_source = j.source
                 LEFT JOIN users u ON r.user_id = u.id
                 WHERE r.status = 'open'
                 ORDER BY r.reported_at DESC`
            );

            return res.status(200).json({
                success: true,
                count: rows.length,
                data: rows
            });
        } catch (error) {
            console.error('Get reports error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching reported jobs'
            });
        }
    },

    /**
     * @route PATCH /api/reports/:id
     * @desc Update report status (admin only)
     * @access Private (Admin)
     */
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !['open', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'status must be one of: open, reviewed, resolved, dismissed'
                });
            }

            const [result] = await pool.query(
                `UPDATE reported_jobs SET status = ? WHERE id = ?`,
                [status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: `Report status updated to ${status}`
            });
        } catch (error) {
            console.error('Update report status error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating report status'
            });
        }
    },

    /**
     * @route DELETE /api/reports/:id
     * @desc Delete a report (admin only)
     * @access Private (Admin)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const [result] = await pool.query(
                'DELETE FROM reported_jobs WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Report deleted successfully'
            });
        } catch (error) {
            console.error('Delete report error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting report'
            });
        }
    }
};

module.exports = ReportController;
