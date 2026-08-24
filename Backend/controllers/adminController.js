const pool = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * @route GET /api/admin/users
 * @desc Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, firstname, email, role, company, siret, created_at, banned_at FROM users ORDER BY created_at DESC'
        );

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Admin GetAllUsers error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users list'
        });
    }
};

/**
 * @route GET /api/admin/users/:id
 * @desc Get a specific user by ID
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query(
            'SELECT id, name, firstname, email, role, company, siret, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Admin GetUserById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching user details'
        });
    }
};

/**
 * @route PATCH /api/admin/users/:id
 * @desc Update user partially
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No data provided to update" });
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 12);
        }

        delete updates.banned_at;

        let extraSet = '';
        if (updates.role === 'banned') {
            extraSet = ', banned_at = NOW()';
        } else if (updates.role && updates.role !== 'banned') {
            extraSet = ', banned_at = NULL';
        }

        const keys = Object.keys(updates);
        const query = `UPDATE users SET ${keys.map(key => `${key} = ?`).join(', ')}${extraSet} WHERE id = ?`;
        const values = [...Object.values(updates), id];

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: 'User updated successfully' });

    } catch (error) {
        console.error('Admin PATCH error:', error);
        return res.status(500).json({ success: false, message: 'Error updating user' });
    }
};

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete a user
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user && parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Admin DeleteUser error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

/**
 * @route POST /api/admin/setup-master
 * @desc Créer le TOUT PREMIER compte administrateur
 */
const registerAdmin = async (req, res) => {
    try {
        const [adminCheck] = await pool.query(
            "SELECT COUNT(*) as adminCount FROM users WHERE role = 'admin'"
        );

        const { name, firstname, email, password, company, siret } = req.body;

        if (!name || !firstname || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires (name, firstname, email, password)'
            });
        }

        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.query(
            'INSERT INTO users (name, firstname, email, password, role, company, siret) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, firstname, email, hashedPassword, 'admin', company || null, siret || null]
        );

        return res.status(201).json({
            success: true,
            message: 'Compte Administrateur forcé configuré avec succès !',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Admin RegisterAdmin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la configuration du compte administrateur'
        });
    }
};

/**
 * @route GET /api/admin/jobs
 * @desc Récupérer tous les jobs pour l'admin
 */
const getAllJobsForAdmin = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT j.*, c.name as company_name 
            FROM jobs_dj j                             
            LEFT JOIN companies_dj c ON j.company_id = c.id -- 2. Jointure sur c.id (pas external_id)
            ORDER BY j.created_at DESC
        `);
        return res.status(200).json({ success: true, jobs: rows });
    } catch (error) {
        console.error('Admin getAllJobsForAdmin error:', error);
        return res.status(500).json({ error: "Erreur lors de la récupération des jobs" });
    }
};


/**
 * @route PATCH /api/admin/jobs/:id
 * @desc Approuver ou refuser un job
 */
const updateJobStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      
        const [result] = await pool.query(
            'UPDATE jobs_dj SET status = ? WHERE external_id = ?', 
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Job introuvable avec cet external_id" });
        }

        return res.status(200).json({ success: true, message: "Statut mis à jour avec succès !" });

    } catch (error) {
        console.error("Erreur SQL PATCH :", error);
        return res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

/**
 * @route DELETE /api/admin/jobs/:id
 * @desc Soft delete un job
 */
const deleteJob = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'UPDATE jobs_dj SET is_deleted = TRUE WHERE external_id = ?', 
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Job introuvable avec cet external_id" });
        }

        return res.status(200).json({ success: true, message: "Offre archivée en base de données" });
        
    } catch (error) {
        console.error('Erreur SQL DELETE :', error);
        return res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    registerAdmin,
    getAllJobsForAdmin,
    updateJobStatus,
    deleteJob,
};
