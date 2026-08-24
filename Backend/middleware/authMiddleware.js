const jwt = require('jsonwebtoken');

/**
 * @description JWT Authentication Middleware
 * Verifies the Bearer token in the Authorization header
 */
function authenticateToken(req, res, next) {
    const token = req.cookies?.token || (req.headers['authorization']?.split(' ')[1]);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        return res.status(403).json({
            success: false,
            message: 'Invalid token.'
        });
    }
}

module.exports = authenticateToken;
