// ---------------------------------------------------------------------------
// Mock mysql2/promise so ingestionService can load without a real DB.
// ---------------------------------------------------------------------------
jest.mock('mysql2/promise', () => {
    const mockQuery = jest.fn(() => Promise.resolve([[{ cnt: 1 }]]));
    const mockGetConnection = jest.fn(() => Promise.resolve({ release: jest.fn() }));
    const mockPool = {
        query: mockQuery,
        getConnection: mockGetConnection,
    };
    return { createPool: jest.fn(() => mockPool) };
});

const { normalizeJob } = require('../services/ingestionService');

describe('Data Normalization', () => {
    /**
     * Requirement: automated tests covering at minimum one data normalization function
     * Test: normalizeJob — transforms raw WeLoveDevs payload into our schema
     */
    test('normalizeJob — maps raw WLD data correctly', () => {
        const raw = {
            id: 'job-abc-123',
            title: 'Senior Fullstack Developer',
            rawDescription: '\u003cp\u003eBuild awesome things with Node\u003c/p\u003e',
            details: {
                salary: { min: 50000, max: 70000, currency: 'EUR' },
                remotePolicy: { frequency: 'full_remote' },
                requiredExperience: 5,
            },
            smallCompany: {
                id: 42,
                companyName: 'Acme Corp',
                sectors: ['SaaS'],
            },
            contractTypes: ['permanent'],
            skillsList: ['Node.js', 'React', 'PostgreSQL'],
            formattedPlaces: ['Paris, France'],
            publishDate: 1715193600000000, // 2024-05-08 in µs
        };

        const result = normalizeJob(raw);

        expect(result.external_id).toBe('job-abc-123');
        expect(result.title).toBe('Senior Fullstack Developer');
        expect(result.description).toBe('<p>Build awesome things with Node</p>');
        expect(result.salary_min).toBe(50000);
        expect(result.salary_max).toBe(70000);
        expect(result.currency).toBe('EUR');
        expect(result.contract_type).toBe('CDI');
        expect(result.remote_type).toBe('remote');
        expect(result.experience_years).toBe(5);
        expect(result.company_id).toBe('42');
        expect(result.company_name).toBe('Acme Corp');
        expect(result.company_sector).toBe('SaaS');
        expect(result.location).toBe('Paris, France');
        expect(result.skills).toBe(JSON.stringify(['Node.js', 'React', 'PostgreSQL']));
    });

    test('normalizeJob — handles missing/null fields gracefully', () => {
        const raw = {
            id: 'job-xyz',
            title: '',
            rawDescription: '',
            contractTypes: [],
            skillsList: [],
            formattedPlaces: [],
            publishDate: null,
        };

        const result = normalizeJob(raw);

        expect(result.title).toBe('Sans titre');
        expect(result.description).toBeNull();
        expect(result.contract_type).toBeNull();
        expect(result.salary_min).toBeNull();
        expect(result.salary_max).toBeNull();
        expect(result.remote_type).toBe('onsite');
        expect(result.location).toBeNull();
        expect(result.skills).toBe(JSON.stringify([]));
        // Should fall back to a valid SQL datetime
        expect(result.created_at).toBeTruthy();
    });
});
