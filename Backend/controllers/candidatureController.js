const pool = require('../config/db');

const CandidatureController = {
    async getMyApplications(req, res) {
        try {
            const userId = req.user.userId;

            const [rows] = await pool.query(
                `SELECT a.id, a.job_id, a.job_source, a.applied_at,
                        j.title, j.company_name, j.contract_type, j.remote_type,
                        j.salary_min, j.salary_max, j.currency, j.skills
                 FROM applications a
                 LEFT JOIN unified_jobs j ON a.job_id = j.id AND a.job_source = j.source
                 WHERE a.user_id = ?
                 ORDER BY a.applied_at DESC`,
                [userId]
            );

            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error('Get applications error:', error);
            return res.status(500).json({ success: false, message: 'Error fetching applications' });
        }
    },

    async getApplicationById(req, res) {
        try {
            const { userId, role } = req.user;
            const { id } = req.params;

            let rows;

            if (role === 'recruiter' || role === 'admin') {
                // Recruiter: can view any application for a job belonging to their company
                [rows] = await pool.query(
                    `SELECT a.id, a.job_id, a.job_source, a.applied_at, a.status,
                            a.cv_path, a.cover_letter_path, a.extra_documents_path,
                            a.applicant_firstname, a.applicant_name, a.applicant_gender,
                            a.applicant_email, a.applicant_phone, a.applicant_postal_code, a.applicant_city,
                            j.title, j.company_name, j.contract_type, j.remote_type,
                            j.salary_min, j.salary_max, j.currency, j.skills,
                            u.firstname, u.name, u.email, u.skills AS candidate_skills, u.location
                     FROM applications a
                     LEFT JOIN unified_jobs j ON a.job_id = j.id AND a.job_source = j.source
                     JOIN users u ON a.user_id = u.id
                     WHERE a.id = ?`,
                    [id]
                );
            } else {
                // Applicant: can only view their own application
                [rows] = await pool.query(
                    `SELECT a.id, a.job_id, a.job_source, a.applied_at, a.status,
                            a.cv_path, a.cover_letter_path, a.extra_documents_path,
                            a.applicant_firstname, a.applicant_name, a.applicant_gender,
                            a.applicant_email, a.applicant_phone, a.applicant_postal_code, a.applicant_city,
                            j.title, j.company_name, j.contract_type, j.remote_type,
                            j.salary_min, j.salary_max, j.currency, j.skills
                     FROM applications a
                     LEFT JOIN unified_jobs j ON a.job_id = j.id AND a.job_source = j.source
                     WHERE a.id = ? AND a.user_id = ?`,
                    [id, userId]
                );
            }

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Application not found' });
            }

            return res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('Get application by id error:', error);
            return res.status(500).json({ success: false, message: 'Error fetching application' });
        }
    },

    async getApplicationsByJob(req, res) {
        try {
            const { userId, role } = req.user;
            const { jobId } = req.params;

            if (role !== 'admin') {
                const [users] = await pool.query(
                    'SELECT company FROM users WHERE id = ?',
                    [userId]
                );

                if (users.length === 0 || !users[0].company) {
                    return res.status(404).json({ success: false, message: 'No company linked to this account' });
                }

                const [jobs] = await pool.query(
                    `SELECT j.id FROM jobs_dj j
                     JOIN companies_dj c ON j.company_id = c.id
                     WHERE j.id = ? AND c.name = ?`,
                    [jobId, users[0].company]
                );

                if (jobs.length === 0) {
                    return res.status(403).json({ success: false, message: 'This job does not belong to your company' });
                }
            }

            const [rows] = await pool.query(
                `SELECT a.id, a.job_id, a.job_source, a.applied_at,
                        u.id AS user_id, u.firstname, u.name, u.email, u.skills AS candidate_skills, u.location
                 FROM applications a
                 JOIN users u ON a.user_id = u.id
                 WHERE a.job_id = ?
                 ORDER BY a.applied_at DESC`,
                [jobId]
            );

            return res.status(200).json({ success: true, count: rows.length, data: rows });
        } catch (error) {
            console.error('Get applications by job error:', error);
            return res.status(500).json({ success: false, message: 'Error fetching applications' });
        }
    },

    async updateApplicationStatus(req, res) {
        try {
            const { userId, role } = req.user;
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !['accepted', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ success: false, message: 'status must be pending, accepted or rejected' });
            }

            const [rows] = await pool.query(
                `SELECT a.id, a.job_id FROM applications a
                 JOIN jobs_dj j ON a.job_id = j.id
                 JOIN companies_dj c ON j.company_id = c.id
                 JOIN users u ON u.id = ?
                 WHERE a.id = ? AND (? = 'admin' OR c.name = u.company)`,
                [userId, id, role]
            );

            if (rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Application not found or not authorized' });
            }

            await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

            return res.status(200).json({ success: true, message: `Application ${status}` });
        } catch (error) {
            console.error('Update application status error:', error);
            return res.status(500).json({ success: false, message: 'Error updating application status' });
        }
    },

    async deleteApplication(req, res) {
        try {
            const { userId, role } = req.user;
            const { id } = req.params;

            let rows;

            if (role === 'recruiter' || role === 'admin') {
                [rows] = await pool.query(
                    `SELECT a.id FROM applications a
                     JOIN jobs_dj j ON a.job_id = j.id
                     JOIN companies_dj c ON j.company_id = c.id
                     JOIN users u ON u.id = ?
                     WHERE a.id = ? AND (? = 'admin' OR c.name = u.company)`,
                    [userId, id, role]
                );
            } else {
                [rows] = await pool.query(
                    'SELECT id FROM applications WHERE id = ? AND user_id = ?',
                    [id, userId]
                );
            }

            if (rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Application not found or not authorized' });
            }

            await pool.query('DELETE FROM applications WHERE id = ?', [id]);

            return res.status(200).json({ success: true, message: 'Application deleted' });
        } catch (error) {
            console.error('Delete application error:', error);
            return res.status(500).json({ success: false, message: 'Error deleting application' });
        }
    },

    async apply(req, res) {
        try {
            const userId = req.user.userId;
            const { job_id, job_source } = req.body;

            if (!job_id || !job_source) {
                return res.status(400).json({ success: false, message: 'job_id and job_source are required' });
            }

            const cv = req.files?.cv?.[0]?.filename ?? null;
            const coverLetter = req.files?.cover_letter?.[0]?.filename ?? null;
            const extraDocs = req.files?.extra_documents?.[0]?.filename ?? null;

            const { firstname, name, gender, email, phone, postal_code, city } = req.body;

            await pool.query(
                `INSERT INTO applications
                    (user_id, job_id, job_source, cv_path, cover_letter_path, extra_documents_path,
                     applicant_firstname, applicant_name, applicant_gender, applicant_email,
                     applicant_phone, applicant_postal_code, applicant_city)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, job_id, job_source, cv, coverLetter, extraDocs,
                 firstname ?? null, name ?? null, gender ?? null, email ?? null,
                 phone ?? null, postal_code ?? null, city ?? null]
            );

            return res.status(201).json({ success: true, message: 'Application submitted' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Already applied to this job' });
            }
            console.error('Apply error:', error);
            return res.status(500).json({ success: false, message: 'Error submitting application' });
        }
    },
};

module.exports = CandidatureController;
