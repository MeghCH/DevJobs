require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const ingestionRoutes = require('./routes/ingestionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const candidatureRoutes = require('./routes/candidatureRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const reportRoutes = require('./routes/reportRoutes');

const path = require('path');
const fs   = require('fs');

const app = express();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Middleware ──────────────────────────────────────────────────────────
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

// ── Routes ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.status(200).json({
    success: true,
    message: 'Server is running'
}));

app.use('/api/auth',         authRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/ingest',       ingestionRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/applications', candidatureRoutes);
app.use('/api/saved',        savedJobRoutes);
app.use('/api/reports',      reportRoutes);

// ── Error handlers ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({
    success: false,
    message: 'Route not found'
}));

app.use((_err, _req, res, _next) => res.status(500).json({
    success: false,
    message: 'Something went wrong!'
}));

module.exports = app;
