const pool = require('../config/db');

const WLD_BASE_URL = process.env.WLD_API_BASE_URL || 'https://epi-api.welovedevs.com';
const API_KEY = process.env.WLD_API_KEY;
const DELAY_MS = 1050; // 1 req/s + 50 ms margin

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Safe parse helpers ──────────────────────────────────────

function safeParseInt(value) {
    if (value === null || value === undefined) return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Convertit une valeur WLD (epoch µs) en format MySQL DATETIME.
 * WLD envoie les timestamps en microsecondes (16 chiffres), pas millisecondes.
 */
function toMySqlTimestamp(value) {
    if (!value) return null;
    // WLD dates are in microseconds — divide by 1000 to get milliseconds
    const ms = Math.floor(Number(value) / 1000);
    if (Number.isNaN(ms)) return null;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    // Format: 2024-05-09 16:00:00
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

// ── Mapping helpers ───────────────────────────────────────

/**
 * Normalise un type de contrat WLD vers le format interne
 */
function normalizeContractType(wldValue) {
    if (!wldValue) return null;
    const v = wldValue.toString().toLowerCase();

    if (v.includes('permanent') || v.includes('cdi')) return 'CDI';
    if (v.includes('fixed') || v.includes('cdd')) return 'CDD';
    if (v.includes('internship') || v.includes('stage')) return 'Stage';
    if (v.includes('apprenticeship') || v.includes('alternance')) return 'Alternance';
    if (v.includes('freelance')) return 'Freelance';

    // Fallback: return the original uppercase
    return wldValue.toString().toUpperCase();
}

/**
 * Normalise la politique de remote WLD
 */
function normalizeRemoteType(wldValue) {
    if (!wldValue) return 'onsite';
    const v = wldValue.toString().toLowerCase();

    if (v === 'full_remote' || v === 'total' || v === 'remote') return 'remote';
    if (v === 'partial' || v === 'hybrid') return 'hybrid';
    if (v === 'no_remote' || v === 'no' || v === 'onsite') return 'onsite';

    return 'onsite'; // default
}

/**
 * Normalise un job WLD brut vers le schéma jobs_wld
 */
function normalizeJob(raw) {
    const details = raw.details || {};
    const salary = details.salary || {};
    const company = raw.smallCompany || {};
    const remotePolicy = details.remotePolicy || {};

    const contractType = normalizeContractType(raw.contractTypes?.[0]);
    const remoteType = normalizeRemoteType(remotePolicy.frequency);

    const skills = Array.isArray(raw.skillsList)
        ? raw.skillsList.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
        : [];

    // WLD expose companyId au niveau racine ET smallCompany.id
    // Quand les deux sont null, on utilise un slug du nom pour ne pas tout merger sur 'unknown'
    const companyName = company.companyName?.trim()
        || company.name?.trim()
        || raw.companyName?.trim()
        || raw.company?.name?.trim()
        || 'Inconnue';

    const companyId = raw.companyId?.toString()
        || company.id?.toString()
        || (companyName !== 'Inconnue'
            ? `name_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
            : 'unknown');

    // Date de publication préférée: publishDate, fallback createdAt
    const dateValue = raw.publishDate || raw.createdAt;
    const createdAt = toMySqlTimestamp(dateValue) || new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Location from formattedPlaces (first entry is usually the city/region)
    const location = Array.isArray(raw.formattedPlaces) && raw.formattedPlaces.length > 0
        ? raw.formattedPlaces[0].trim()
        : null;

    return {
        external_id: raw.id?.toString() || raw.objectID?.toString() || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        company_id: companyId,
        company_name: companyName,
        company_sector: (company.sectors || [])[0] || null,
        title: raw.title?.trim() || 'Sans titre',
        description: (raw.rawDescription || raw.description)?.trim() || null,
        salary_min: safeParseInt(salary.min),
        salary_max: safeParseInt(salary.max),
        currency: (salary.currency || details.currency || 'EUR').trim().toUpperCase(),
        contract_type: contractType,
        experience_years: safeParseInt(details.requiredExperience),
        remote_type: remoteType,
        location,
        skills: JSON.stringify(skills),
        created_at: createdAt,
    };
}

// ── Fetch / DB ──────────────────────────────────────────────

async function fetchWldPage(page = 0, size = 100) {
    const url = new URL('/v1', WLD_BASE_URL);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('size', size.toString());

    const res = await fetch(url.toString(), {
        headers: {
            'X-API-Key': API_KEY,
            Accept: 'application/json',
        },
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`[Ingestion] WLD API HTTP ${res.status}: ${body}`);
        throw new Error(`WLD API returned ${res.status}: ${body}`);
    }

    return res.json();
}

async function upsertCompany(pool, company) {
    await pool.query(
        `INSERT INTO companies_wld (id, name, sector) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), sector = VALUES(sector)`,
        [company.id, company.name, company.sector],
    );
}

async function insertJob(pool, job) {
    await pool.query(
        `INSERT IGNORE INTO jobs_wld (
            external_id, company_id, title, description,
            salary_min, salary_max, currency,
            contract_type, experience_years, remote_type, location, skills, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            job.external_id,
            job.company_id,
            job.title,
            job.description,
            job.salary_min,
            job.salary_max,
            job.currency,
            job.contract_type,
            job.experience_years,
            job.remote_type,
            job.location,
            job.skills,
            job.created_at,
        ],
    );
}

// ── Core ingestion loop ─────────────────────────────────────

/**
 * Ingestion générique : fetch + insert avec comptage précis.
 * @param {number|null} maxPages - null = toutes les pages
 */
async function ingestLoop(maxPages = null) {
    if (!API_KEY) {
        throw new Error('WLD_API_KEY is not defined in environment.');
    }

    let page = 0;
    const size = 100;
    let totalCount = null;
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    let consecutiveErrors = 0;

    while (true) {
        // Stop si on a atteint le maxPages
        if (maxPages !== null && page >= maxPages) break;

        let data;
        try {
            data = await fetchWldPage(page, size);
            consecutiveErrors = 0;
        } catch (err) {
            console.error(`[Ingestion] Fetch error on page ${page}:`, err.message);
            errors += 1;
            consecutiveErrors += 1;
            if (consecutiveErrors >= 3) {
                console.error('[Ingestion] 3 consecutive fetch failures. Stopping.');
                break;
            }
            page += 1;
            await delay(DELAY_MS);
            continue;
        }

        if (totalCount === null) {
            totalCount = data.totalCount || 0;
            console.log(`[Ingestion] Total offers available: ${totalCount}`);
        }

        const jobs = data.values || [];
        if (jobs.length === 0) break;

        for (const raw of jobs) {
            const normalized = normalizeJob(raw);

            try {
                await upsertCompany(pool, {
                    id: normalized.company_id,
                    name: normalized.company_name,
                    sector: normalized.company_sector,
                });

                // Déduplication explicite avant insert
                const [existing] = await pool.query(
                    'SELECT 1 FROM jobs_wld WHERE external_id = ? LIMIT 1',
                    [normalized.external_id],
                );

                if (existing.length === 0) {
                    await insertJob(pool, normalized);
                    inserted += 1;
                } else {
                    skipped += 1;
                }
            } catch (err) {
                console.error(`[Ingestion] Insert error for job ${normalized.id}:`, err.message);
                errors += 1;
            }
        }

        page += 1;

        // Arrêt naturel quand on a tout parcouru
        if (page * size >= totalCount) break;

        // Rate limit
        await delay(DELAY_MS);
    }

    return { inserted, skipped, errors, pagesFetched: page };
}

// ── Public API ────────────────────────────────────────────

async function run() {
    return ingestLoop(null); // toutes les pages
}

async function runLimited(maxPages = 1) {
    return ingestLoop(maxPages);
}

module.exports = { run, runLimited, normalizeJob };
