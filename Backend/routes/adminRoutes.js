const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { 
    getAllJobsForAdmin, 
    updateJobStatus, 
    deleteJob, 
    getAllUsers, 
    getUserById,
    updateUser, 
    deleteUser, 
    registerAdmin 
} = require('../controllers/adminController');

// --- ROUTES JOBS ---
router.get('/jobs', authenticateToken, authorizeRoles('admin'), getAllJobsForAdmin);
router.patch('/jobs/:id', authenticateToken, authorizeRoles('admin'), updateJobStatus);
router.delete('/jobs/:id', authenticateToken, authorizeRoles('admin'), deleteJob);

// --- ROUTES USERS ---
router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.get('/users/:id', authenticateToken, authorizeRoles('admin'), getUserById);
router.patch('/users/:id', authenticateToken, authorizeRoles('admin'), updateUser);
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

// POST /api/admin/setup-master — bootstrap first admin (protected by controller: only works if no admin exists)
// Note: This route requires authentication to prevent unauthorized admin creation
router.post('/setup-master', authenticateToken, authorizeRoles('admin'), registerAdmin);

module.exports = router;