require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'jobaggregator',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ── Promise ready : résolue quand le schema est assuré ─────
let _readyResolve;
const ready = new Promise(resolve => _readyResolve = resolve);

// ── Schema bootstrap (idempotent) ───────────────────────────
const MIGRATIONS = [
    `CREATE TABLE IF NOT EXISTS companies_wld (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sector VARCHAR(255)
    )`,

    `CREATE TABLE IF NOT EXISTS jobs_wld (
        id INT AUTO_INCREMENT PRIMARY KEY,
        external_id VARCHAR(255) NOT NULL UNIQUE,
        company_id VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        salary_min INT,
        salary_max INT,
        currency VARCHAR(10),
        contract_type VARCHAR(50),
        experience_years INT,
        remote_type VARCHAR(50),
        location VARCHAR(255),
        created_at DATETIME,
        skills JSON,
        FOREIGN KEY (company_id) REFERENCES companies_wld(id)
    )`,

    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user','recruiter','admin') DEFAULT 'user',
        company VARCHAR(255) DEFAULT NULL,
        siret VARCHAR(14) DEFAULT NULL,
        skills JSON DEFAULT NULL,
        location VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `ALTER TABLE users MODIFY COLUMN role ENUM('user','recruiter','admin','banned') DEFAULT 'user'`,
    `ALTER TABLE users ADD COLUMN banned_at TIMESTAMP NULL DEFAULT NULL`,
    `ALTER TABLE jobs_wld MODIFY COLUMN created_at DATETIME`,
    `ALTER TABLE jobs_dj MODIFY COLUMN created_at DATETIME`,

    `CREATE TABLE IF NOT EXISTS companies_dj (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sector VARCHAR(255)
    )`,

    `CREATE TABLE IF NOT EXISTS jobs_dj (
        id INT AUTO_INCREMENT PRIMARY KEY,
        external_id VARCHAR(255) NOT NULL UNIQUE,
        company_id VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        salary_min INT,
        salary_max INT,
        currency VARCHAR(10),
        contract_type VARCHAR(50),
        experience_years INT,
        remote_type VARCHAR(50),
        location VARCHAR(255),
        created_at DATETIME,
        skills JSON,
        FOREIGN KEY (company_id) REFERENCES companies_dj(id)
    )`,

    `ALTER TABLE jobs_wld ADD COLUMN location VARCHAR(255)`,
    `ALTER TABLE jobs_dj ADD COLUMN location VARCHAR(255)`,

    `CREATE OR REPLACE VIEW unified_jobs AS
     SELECT
         j.id, j.company_id, c.name AS company_name, c.sector AS company_sector,
         j.title, j.description, j.salary_min, j.salary_max, j.currency,
         j.contract_type, j.experience_years, j.remote_type, j.location, j.skills, j.created_at,
         'wld' AS source,
         'approved' AS status
     FROM jobs_wld j LEFT JOIN companies_wld c ON j.company_id = c.id
     UNION ALL
     SELECT
         j.id, j.company_id, c.name AS company_name, c.sector AS company_sector,
         j.title, j.description, j.salary_min, j.salary_max, j.currency,
         j.contract_type, j.experience_years, j.remote_type, j.location, j.skills, j.created_at,
         'dj' AS source,
         j.status
     FROM jobs_dj j LEFT JOIN companies_dj c ON j.company_id = c.id
     WHERE j.is_deleted = FALSE`,

    `CREATE TABLE IF NOT EXISTS reported_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        job_source ENUM('wld', 'dj') NOT NULL,
        user_id INT NOT NULL,
        reason TEXT DEFAULT NULL,
        status ENUM('open', 'reviewed', 'resolved', 'dismissed') DEFAULT 'open',
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_report (user_id, job_id, job_source)
    )`,
];

async function ensureSchema() {
    console.log('[DB] Checking schema...');
    for (const sql of MIGRATIONS) {
        try {
            await pool.query(sql);
        } catch (err) {
            if (err.code === 'ER_WRONG_VIEW') {
                console.warn('[DB] View mismatch, dropping and recreating...');
                await pool.query('DROP VIEW IF EXISTS unified_jobs');
                await pool.query(sql);
            } else if (err.code === 'ER_DUP_FIELDNAME') {
                // Column already exists — migration already applied
            } else {
                throw err;
            }
        }
    }
    console.log('[DB] Schema ready.');
}

/**
 * Crée le compte admin par défaut si aucun admin n'existe.
 */
async function seedAdmin() {
    const [[existing]] = await pool.query(
        "SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'"
    );
    if (existing.cnt > 0) {
        console.log('[DB] Admin user already exists — skipping seed.');
        return;
    }

    const rawPassword = process.env.ADMIN_PASSWORD || 'admin-default-change-me';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    await pool.query(
        `INSERT INTO users (firstname, name, email, password, role)
         VALUES (?, ?, ?, ?, ?)`,
        ['Admin', 'Système', 'admin@exemple.com', hashedPassword, 'admin']
    );
    console.log('[DB] Default admin user seeded (admin@exemple.com).');
}

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database.');
        connection.release();

        await ensureSchema();
        await seedAdmin();
        _readyResolve();
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        process.exit(1);
    }
}

testConnection();

pool.ready = ready;
module.exports = pool;
