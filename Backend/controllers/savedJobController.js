const pool = require('../config/db');

const SavedJobController = {
    async getSavedJobs(req, res) {
        try {
            const userId = req.user.userId;

            const [rows] = await pool.query(
                `SELECT s.id, s.job_id, s.job_source, s.saved_at,
                        j.title, j.company_name, j.contract_type, j.remote_type,
                        j.salary_min, j.salary_max, j.currency, j.skills
                 FROM saved_jobs s
                 LEFT JOIN unified_jobs j ON s.job_id = j.id
                 WHERE s.user_id = ?
                 ORDER BY s.saved_at DESC`,
                [userId]
            );

            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error('Get saved jobs error:', error);
            return res.status(500).json({ success: false, message: 'Error fetching saved jobs' });
        }
    },

    async getSavedIds(req, res) {
        try {
            const userId = req.user.userId;

            const [rows] = await pool.query(
                'SELECT job_id FROM saved_jobs WHERE user_id = ?',
                [userId]
            );

            return res.status(200).json({ success: true, data: rows.map(r => r.job_id) });
        } catch (error) {
            console.error('Get saved ids error:', error);
            return res.status(500).json({ success: false, message: 'Error fetching saved job ids' });
        }
    },

    async saveJob(req, res) {
        try {
            const userId = req.user.userId;
            const { job_id, job_source } = req.body;

            if (!job_id || !job_source) {
                return res.status(400).json({ success: false, message: 'job_id and job_source are required' });
            }

            await pool.query(
                'INSERT INTO saved_jobs (user_id, job_id, job_source) VALUES (?, ?, ?)',
                [userId, job_id, job_source]
            );

            return res.status(201).json({ success: true, message: 'Job saved' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Job already saved' });
            }
            console.error('Save job error:', error);
            return res.status(500).json({ success: false, message: 'Error saving job' });
        }
    },

    async unsaveJob(req, res) {
        try {
            const userId = req.user.userId;
            const { job_id } = req.params;

            await pool.query(
                'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?',
                [userId, job_id]
            );

            return res.status(200).json({ success: true, message: 'Job removed from saved' });
        } catch (error) {
            console.error('Unsave job error:', error);
            return res.status(500).json({ success: false, message: 'Error removing saved job' });
        }
    },
};

module.exports = SavedJobController;
