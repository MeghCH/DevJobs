const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'JobAggregator API',
            version: '1.0.0',
            description: 'DevJobs - Job board backend API with authentication and job offer management',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Doe' },
                        firstname: { type: 'string', example: 'John' },
                        email: { type: 'string', example: 'john@example.com' },
                        role: { type: 'string', enum: ['user', 'recruiter', 'admin'] },
                        company: { type: 'string', example: 'Acme Corp' },
                        siret: { type: 'string', example: '12345678901234' },
                        skills: { type: 'string', example: '["JavaScript","Node.js"]' },
                        location: { type: 'string', example: 'Paris, France' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Job: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        external_id: { type: 'string', example: '-OryapSOhW7-SHvNc_Ho' },
                        company_id: { type: 'string', example: 'comp-001' },
                        company_name: { type: 'string', example: 'Acme Corp' },
                        title: { type: 'string', example: 'Senior Fullstack Developer' },
                        description: { type: 'string' },
                        salary_min: { type: 'integer', example: 50000 },
                        salary_max: { type: 'integer', example: 70000 },
                        currency: { type: 'string', example: 'EUR' },
                        contract_type: { type: 'string', example: 'CDI' },
                        experience_years: { type: 'integer', example: 5 },
                        remote_type: { type: 'string', example: 'hybrid' },
                        location: { type: 'string', example: 'Paris, France' },
                        skills: { type: 'string', example: '["JavaScript","React"]' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Application: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        job_id: { type: 'integer', example: 1 },
                        job_source: { type: 'string', example: 'wld' },
                        applied_at: { type: 'string', format: 'date-time' },
                        title: { type: 'string', example: 'Senior Fullstack Developer' },
                        company_name: { type: 'string', example: 'Acme Corp' },
                        contract_type: { type: 'string', example: 'CDI' },
                        remote_type: { type: 'string', example: 'hybrid' },
                        salary_min: { type: 'integer', example: 50000 },
                        salary_max: { type: 'integer', example: 70000 },
                        currency: { type: 'string', example: 'EUR' },
                        skills: { type: 'string' },
                    },
                },
                SavedJob: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        job_id: { type: 'string', example: 'job-001' },
                        job_source: { type: 'string', example: 'wld' },
                        saved_at: { type: 'string', format: 'date-time' },
                        title: { type: 'string', example: 'Senior Fullstack Developer' },
                        company_name: { type: 'string', example: 'Acme Corp' },
                        contract_type: { type: 'string', example: 'CDI' },
                        remote_type: { type: 'string', example: 'hybrid' },
                        salary_min: { type: 'integer', example: 50000 },
                        salary_max: { type: 'integer', example: 70000 },
                        currency: { type: 'string', example: 'EUR' },
                        skills: { type: 'string' },
                    },
                },
                IngestionResult: {
                    type: 'object',
                    properties: {
                        inserted: { type: 'integer', example: 42, description: 'New offers inserted' },
                        skipped: { type: 'integer', example: 58, description: 'Duplicates skipped' },
                        errors: { type: 'integer', example: 0, description: 'Errors encountered' },
                        pagesFetched: { type: 'integer', example: 1 },
                    },
                },
                ReportedJob: {
                    type: 'object',
                    properties: {
                        report_id: { type: 'integer', example: 1 },
                        job_id: { type: 'integer', example: 42 },
                        job_source: { type: 'string', enum: ['wld', 'dj'], example: 'wld' },
                        reason: { type: 'string', example: 'This offer seems fraudulent.' },
                        report_status: { type: 'string', enum: ['open', 'reviewed', 'resolved', 'dismissed'], example: 'open' },
                        reported_at: { type: 'string', format: 'date-time' },
                        resolved_at: { type: 'string', format: 'date-time', nullable: true },
                        job_title: { type: 'string', example: 'Senior Fullstack Developer' },
                        company_name: { type: 'string', example: 'Acme Corp' },
                        contract_type: { type: 'string', example: 'CDI' },
                        location: { type: 'string', example: 'Paris, France' },
                        job_status: { type: 'string', example: 'approved' },
                        reporter_id: { type: 'integer', example: 5 },
                        reporter_name: { type: 'string', example: 'John Doe' },
                        reporter_email: { type: 'string', example: 'john@example.com' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation completed successfully' },
                    },
                },
            },
        },
    },
    apis: ['./routes/*.js', './controllers/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
