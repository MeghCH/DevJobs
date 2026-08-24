const pool = require('../config/db');

/**
 * @description Unified Jobs Query Helper
 * Provides a single function to fetch all job offers
 * from both the DevJobs (dj) and WeLoveDevs (wld) sources.
 */
async function getAllUnified() {
    const [rows] = await pool.query(
        `SELECT
            id,
            company_id,
            company_name,
            company_sector,
            title,
            description,
            salary_min,
            salary_max,
            currency,
            contract_type,
            experience_years,
            remote_type,
            skills,
            created_at,
            source
         FROM unified_jobs
         ORDER BY created_at DESC`
    );
    return rows;
}

module.exports = { getAllUnified };
