/**
 * @description Role Authorization Middleware
 * Restricts access to users with allowed roles
 *
 * Usage:
 *   router.post('/', authenticateToken, authorizeRoles('recruiter', 'admin'), controller.create)
 */
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }

        const userRole = req.user.role.toLowerCase();
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`
            });
        }

        next();
    };
}

module.exports = authorizeRoles;
