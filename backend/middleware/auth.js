/**
 * Authentication middleware
 */

/**
 * Require authentication - protect routes
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }

    res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
    });
}

/**
 * Optional authentication - add user if logged in
 */
function optionalAuth(req, res, next) {
    if (req.session && req.session.userId) {
        req.userId = req.session.userId;
    }
    next();
}

/**
 * Get current user from session
 */
function getCurrentUser(req) {
    if (req.session && req.session.userId) {
        return {
            id: req.session.userId,
            email: req.session.userEmail,
            displayName: req.session.displayName
        };
    }
    return null;
}

module.exports = {
    requireAuth,
    optionalAuth,
    getCurrentUser
};
