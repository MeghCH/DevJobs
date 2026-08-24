CREATE DATABASE IF NOT EXISTS jobaggregator;
USE jobaggregator;

-- --- ENTREPRISES ---
CREATE TABLE IF NOT EXISTS companies_wld (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS companies_dj (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255)
);

-- --- UTILISATEURS ---
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','recruiter','admin','banned') DEFAULT 'user',
    company VARCHAR(255) DEFAULT NULL,
    siret VARCHAR(14) DEFAULT NULL,
    skills JSON DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --- JOBS EXTERNES (WeLoveDevs) ---
CREATE TABLE IF NOT EXISTS jobs_wld (
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
    created_at TIMESTAMP,
    skills JSON, 
    FOREIGN KEY (company_id) REFERENCES companies_wld(id)
);

-- --- JOBS INTERNES (DevJobs) ---
CREATE TABLE IF NOT EXISTS jobs_dj (
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
    created_at TIMESTAMP,
    skills JSON,
    -- Nouvelles colonnes IA et Admin
    ai_summary TEXT,
    ai_tags JSON,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_deleted BOOLEAN DEFAULT FALSE, -- Pour le Soft Delete
    FOREIGN KEY (company_id) REFERENCES companies_dj(id)
);

-- --- SAUVEGARDES ET CANDIDATURES ---
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    job_source ENUM('wld', 'dj') NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved (user_id, job_source, job_id)
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    job_source ENUM('wld', 'dj') NOT NULL,
    cv_path VARCHAR(512) DEFAULT NULL,
    cover_letter_path VARCHAR(512) DEFAULT NULL,
    extra_documents_path VARCHAR(512) DEFAULT NULL,
    applicant_firstname VARCHAR(100) DEFAULT NULL,
    applicant_name VARCHAR(100) DEFAULT NULL,
    applicant_gender VARCHAR(20) DEFAULT NULL,
    applicant_email VARCHAR(255) DEFAULT NULL,
    applicant_phone VARCHAR(30) DEFAULT NULL,
    applicant_postal_code VARCHAR(10) DEFAULT NULL,
    applicant_city VARCHAR(100) DEFAULT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (user_id, job_source, job_id)
);

CREATE OR REPLACE VIEW unified_jobs AS
SELECT
    j.id,
    j.company_id,
    c.name AS company_name,
    c.sector AS company_sector,
    j.title,
    j.description,
    j.salary_min,
    j.salary_max,
    j.currency,
    j.contract_type,
    j.experience_years,
    j.remote_type,
    j.location,
    j.skills,
    j.created_at,
    'wld' AS source,
    'approved' AS status
FROM jobs_wld j
LEFT JOIN companies_wld c ON j.company_id = c.id

UNION ALL

SELECT
    j.id,
    j.company_id,
    c.name AS company_name,
    c.sector AS company_sector,
    j.title,
    j.description,
    j.salary_min,
    j.salary_max,
    j.currency,
    j.contract_type,
    j.experience_years,
    j.remote_type,
    j.location,
    j.skills,
    j.created_at,
    'dj' AS source,
    j.status
FROM jobs_dj j
LEFT JOIN companies_dj c ON j.company_id = c.id
WHERE j.is_deleted = FALSE;

-- --- SIGNALEMENTS ---
CREATE TABLE IF NOT EXISTS reported_jobs (
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
);