const pool = require('../config/db');
const axios = require('axios');
/**
 * @description Job Controller
 * Handles job offer creation and retrieval
 */
const JobController = {
    /**
     * @route POST /api/jobs
     * @desc Create a new job offer (recruiter or admin only)
     * @access Private (Recruiter, Admin)
     */
    async create(req, res) {
        try {
            const {
                external_id,
                title,
                description,
                salary_min,
                salary_max,
                currency,
                contract_type,
                experience_years,
                remote_type,
                location,
                skills
            } = req.body;

            if (!title) {
                return res.status(400).json({ success: false, message: 'Le titre est requis' });
            }

            // Récupérer l'entreprise du recruteur connecté
            const [users] = await pool.query('SELECT company, siret FROM users WHERE id = ?', [req.user.userId]);
            if (!users.length || !users[0].company) {
                return res.status(400).json({ success: false, message: 'Aucune entreprise liée à votre compte' });
            }
            const companyName = users[0].company;
            const companyId = `company_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

            // Upsert de l'entreprise dans companies_dj
            await pool.query(
                'INSERT INTO companies_dj (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
                [companyId, companyName]
            );

            let ai_summary = null;
            let ai_tags = null;
            if (description) {
                try {
                    const resSum = await axios.post('http://ai-service:8000/summarize', { description });
                    ai_summary = resSum.data.summary;
                    const resAna = await axios.post('http://ai-service:8000/analyze', { description });
                    ai_tags = JSON.stringify(resAna.data.analysis);
                } catch (iaError) {
                    console.error("Erreur IA :", iaError.message);
                }
            }

            const company_id = companyId;

            // Insert into jobs_dj (id is auto-increment)
            const [result] = await pool.query(
                `INSERT INTO jobs_dj (
                    external_id, company_id, title, description,
                    salary_min, salary_max, currency,
                    contract_type, experience_years, remote_type, location, skills, ai_summary, ai_tags, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    external_id || `dj_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    company_id,
                    title,
                    description || null,
                    salary_min || null,
                    salary_max || null,
                    currency || null,
                    contract_type || null,
                    experience_years || null,
                    remote_type || null,
                    location || null,
                    skills ? JSON.stringify(skills) : null,
                    ai_summary,
                    ai_tags
                ]
            );

            const newId = result.insertId;
            const [newJob] = await pool.query(
                'SELECT * FROM jobs_dj WHERE id = ?',
                [newId]
            );

            return res.status(201).json({
                success: true,
                message: 'Job offer created successfully',
                data: newJob[0]
            });

        } catch (error) {
            console.error('Create job error:', error);

            // Duplicate entry
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'A job with this external_id already exists'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error creating job offer'
            });
        }
    },

    async summarize(req, res) {
        try {
            const { description } = req.body;

            if (!description) {
                return res.status(400).json({
                    success: false,
                    message: 'Description is required'
                });
            }

            const response = await axios.post('http://ai-service:8000/summarize', { description });
            
            return res.status(200).json({
                success: true,
                summary: response.data.summary
            });
        } catch (error) {
            console.error('Summarize error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error communicating with AI service'
            });
        }
    },
    /**
     * @route POST /api/jobs/analyze
     * @desc Analyze job description to extract skills and tags
     */
    async analyze(req, res) {
        try {
            const { description } = req.body;

            if (!description) {
                return res.status(400).json({
                    success: false,
                    message: 'Description is required'
                });
            }

            const response = await axios.post('http://ai-service:8000/analyze', { description });

            return res.status(200).json({
                success: true,
                analysis: response.data.analysis
            });
        } catch (error) {
            console.error('Analyze error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error communicating with AI service for analysis'
            });
        }
    },

    async getRecruiter(req, res) {
        try {
            const { userId, role } = req.user;

            if (role === 'admin') {
                const [jobs] = await pool.query('SELECT * FROM jobs_dj ORDER BY created_at DESC');
                return res.status(200).json({ success: true, count: jobs.length, data: jobs });
            }

            const [users] = await pool.query(
                'SELECT company FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0 || !users[0].company) {
                return res.status(404).json({ success: false, message: 'No company linked to this account' });
            }

            const [jobs] = await pool.query(
                `SELECT j.* FROM jobs_dj j
                 JOIN companies_dj c ON j.company_id = c.id
                 WHERE c.name = ?
                 ORDER BY j.created_at DESC`,
                [users[0].company]
            );

            return res.status(200).json({ success: true, count: jobs.length, data: jobs });
        } catch (error) {
            console.error('Get recruiter jobs error:', error);
            return res.status(500).json({ success: false, message: 'Error fetching your jobs' });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const { source } = req.query;

            let query = 'SELECT * FROM unified_jobs WHERE id = ?';
            const params = [id];

            if (source) {
                query += ' AND source = ?';
                params.push(source);
            }

            const [rows] = await pool.query(query, params);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            if (rows.length > 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Multiple jobs found with this ID. Please provide a ?source=wld or ?source=dj query parameter.'
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0]
            });

        } catch (error) {
            console.error('Get job by id error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching job offer'
            });
        }
    },

    async getAll(req, res) {
        try {
            const [jobs] = await pool.query('SELECT * FROM unified_jobs ORDER BY created_at DESC');

            return res.status(200).json({
                success: true,
                count: jobs.length,
                data: jobs
            });

        } catch (error) {
            console.error('Get jobs error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching job offers'
            });
        }
    },

    /**
     * @route DELETE /api/jobs/:id
     * @desc Delete a job offer by ID
     * @access Private (Owner/Recruiter for jobs_dj, Admin for jobs_wld)
     */
    async deleteById(req, res) {
        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            // 1. Try jobs_dj first (manually created jobs)
            const [djJobs] = await pool.query(
                'SELECT * FROM jobs_dj WHERE id = ?',
                [id]
            );

            if (djJobs.length > 0) {
                const job = djJobs[0];

                if (role !== 'admin') {
                    const [users] = await pool.query(
                        'SELECT company FROM users WHERE id = ?',
                        [userId]
                    );

                    if (users.length === 0 || !users[0].company) {
                        return res.status(403).json({
                            success: false,
                            message: 'Forbidden — no company linked to your account'
                        });
                    }

                    const [companies] = await pool.query(
                        'SELECT name FROM companies_dj WHERE id = ?',
                        [job.company_id]
                    );

                    if (companies.length === 0 || companies[0].name !== users[0].company) {
                        return res.status(403).json({
                            success: false,
                            message: 'You can only delete your own company jobs'
                        });
                    }
                }

                await pool.query('DELETE FROM jobs_dj WHERE id = ?', [id]);
                return res.status(200).json({
                    success: true,
                    message: 'Job deleted successfully'
                });
            }

            // 2. Try jobs_wld (ingested jobs) — admin only
            const [wldJobs] = await pool.query(
                'SELECT * FROM jobs_wld WHERE id = ?',
                [id]
            );

            if (wldJobs.length > 0) {
                if (role !== 'admin') {
                    return res.status(403).json({
                        success: false,
                        message: 'Only admins can delete ingested jobs'
                    });
                }

                await pool.query('DELETE FROM jobs_wld WHERE id = ?', [id]);
                return res.status(200).json({
                    success: true,
                    message: 'Job deleted successfully'
                });
            }

            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });

        } catch (error) {
            console.error('Delete job error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting job offer'
            });
        }
    },

    /**
     * @route DELETE /api/jobs/clean-unknown
     * @desc Delete job offers with unknown company or blank title (admin only)
     * @access Private (Admin)
     */
    async getScoredJobs(req, res) {
        try {
            const { userId } = req.user;

            const [users] = await pool.query(
                'SELECT skills, location FROM users WHERE id = ?',
                [userId]
            );
            if (!users.length) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const userSkills = users[0].skills
                ? (typeof users[0].skills === 'string' ? JSON.parse(users[0].skills) : users[0].skills)
                : [];
            const userLocation = users[0].location || '';

            const [jobs] = await pool.query('SELECT * FROM unified_jobs ORDER BY created_at DESC');

            const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()));

            const scored = jobs.map(job => {
                const jobSkills = job.skills
                    ? (typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills)
                    : [];
                const jobAiTags = job.ai_tags
                    ? (typeof job.ai_tags === 'string' ? JSON.parse(job.ai_tags) : job.ai_tags)
                    : [];

                const jobSet = new Set(
                    [...jobSkills, ...jobAiTags].map(s => String(s).toLowerCase().trim())
                );

                let score = 0;

                // Skills match (0–60 pts)
                if (userSet.size > 0 && jobSet.size > 0) {
                    let matches = 0;
                    for (const skill of userSet) {
                        for (const tag of jobSet) {
                            if (tag.includes(skill) || skill.includes(tag)) {
                                matches++;
                                break;
                            }
                        }
                    }
                    score += Math.min(Math.round((matches / userSet.size) * 60), 60);
                }

                // Location match (0–25 pts)
                const remoteType = (job.remote_type || '').toLowerCase();
                if (remoteType === 'remote' || remoteType === 'full_remote') {
                    score += 25;
                } else if (userLocation && job.location) {
                    const uLoc = userLocation.toLowerCase().trim();
                    const jLoc = job.location.toLowerCase().trim();
                    if (uLoc === jLoc || uLoc.includes(jLoc) || jLoc.includes(uLoc)) {
                        score += 25;
                    } else {
                        const uWords = uLoc.split(/[\s,]+/).filter(w => w.length > 3);
                        const jWords = jLoc.split(/[\s,]+/).filter(w => w.length > 3);
                        if (uWords.some(w => jWords.some(jw => jw.includes(w) || w.includes(jw)))) {
                            score += 12;
                        }
                    }
                }

                // Remote bonus (0–15 pts)
                if (remoteType === 'remote' || remoteType === 'full_remote') {
                    score += 15;
                } else if (remoteType === 'hybrid') {
                    score += 8;
                }

                return { ...job, relevance_score: Math.min(score, 100) };
            });

            scored.sort((a, b) => b.relevance_score - a.relevance_score);

            return res.status(200).json({ success: true, count: scored.length, data: scored });
        } catch (error) {
            console.error('Get scored jobs error:', error);
            return res.status(500).json({ success: false, message: 'Error computing relevance scores' });
        }
    },

    async cleanUnknown(req, res) {
        try {
            const [rows] = await pool.query(`
                SELECT COUNT(*) as badCount
                FROM jobs_wld j
                JOIN companies_wld c ON j.company_id = c.id
                WHERE c.name = 'Inconnue' OR j.title = 'Sans titre'
            `);
            const badCount = rows[0]?.badCount || 0;

            if (badCount === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No unknown or untitled jobs found.',
                    deleted: 0
                });
            }

            const [result] = await pool.query(`
                DELETE j FROM jobs_wld j
                JOIN companies_wld c ON j.company_id = c.id
                WHERE c.name = 'Inconnue' OR j.title = 'Sans titre'
            `);

            const deleted = result.affectedRows || 0;

            const [orphanResult] = await pool.query(`
                DELETE c FROM companies_wld c
                LEFT JOIN jobs_wld j ON j.company_id = c.id
                WHERE j.id IS NULL
            `);
            const orphanDeleted = orphanResult.affectedRows || 0;

            return res.status(200).json({
                success: true,
                message: `${deleted} unknown/untitled job(s) removed. ${orphanDeleted} orphaned company(ies) cleaned.`,
                deleted,
                orphanCompaniesDeleted: orphanDeleted
            });
        } catch (error) {
            console.error('Clean unknown jobs error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error cleaning unknown job offers'
            });
        }
    },
};

module.exports = JobController;
