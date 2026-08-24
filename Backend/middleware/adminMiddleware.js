

const isAdmin = (req, res, next) => {
    
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Accès refusé. Droits d'administrateur requis."
        });
    }
};

module.exports = isAdmin;
