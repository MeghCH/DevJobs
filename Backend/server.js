require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const cron = require('node-cron');
const swaggerSpecs = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const ingestionRoutes = require('./routes/ingestionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const candidatureRoutes = require('./routes/candidatureRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const reportRoutes = require('./routes/reportRoutes');
const pool = require('./config/db');

const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(uploadDir));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the current status of the server.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running'
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// ── Ingestion health check at startup ─────────────────
if (process.env.WLD_API_KEY) {
    console.log('[Ingestion] WLD_API_KEY is set');
} else {
    console.warn('[Ingestion] WLD_API_KEY is NOT set — ingestion will fail');
}

// Job routes
app.use('/api/jobs', jobRoutes);

// Ingestion routes
app.use('/api/ingest', ingestionRoutes);
// Admin routes
app.use('/api/admin', adminRoutes);

// Candidature routes
app.use('/api/applications', candidatureRoutes);

// Saved jobs routes
app.use('/api/saved', savedJobRoutes);

// Report routes
app.use('/api/reports', reportRoutes);

// Error handler for 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});

// ── Scheduled ingestion from WeLoveDevs ────────────────────────
// Doit attendre que le pool ait fini son bootstrap (tables/vues créées).
const ingestionService = require('./services/ingestionService');
const INGEST_SCHEDULE = process.env.INGEST_CRON_SCHEDULE || '0 * * * *'; // default: hourly

pool.ready.then(() => {
    if (!process.env.WLD_API_KEY) {
        console.warn('[Cron] WLD_API_KEY not set — skipping scheduled ingestion');
        return;
    }

    // 1. Full ingestion on server boot ONLY if jobs_wld is empty
    // (avoids wasting API calls on every container restart)
    if (process.env.WLD_INGEST_ON_START !== 'false') {
        pool.query('SELECT COUNT(*) as cnt FROM jobs_wld')
            .then(([rows]) => {
                const existing = rows[0]?.cnt || 0;
                if (existing === 0) {
                    console.log('[Ingestion] Table jobs_wld is empty — launching full WLD ingestion...');
                    return ingestionService.run();
                }
                console.log(`[Ingestion] Table jobs_wld already has ${existing} offers — skipping boot ingestion.`);
                return { inserted: 0, skipped: 0, errors: 0, skippedBoot: true };
            })
            .then(stats => console.log('[Ingestion] Boot ingestion result:', stats))
            .catch(err => console.error('[Ingestion] Boot ingestion failed:', err.message));
    }

    // 2. Scheduled incremental ingestion (1 page per run)
    console.log(`[Cron] Scheduling incremental WLD ingestion with pattern: ${INGEST_SCHEDULE}`);
    cron.schedule(INGEST_SCHEDULE, async () => {
        console.log('[Cron] Starting incremental WLD ingestion...');
        try {
            const stats = await ingestionService.runLimited(1); // fetch 1 page (100 offers) per run
            console.log('[Cron] Incremental ingestion done:', stats);
        } catch (err) {
            console.error('[Cron] Incremental ingestion error:', err.message);
        }
    });
});

module.exports = app;
