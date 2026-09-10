/**
 * Middleware to restrict access based on user role(s)
 * @param  {...string} roles - Allowed roles ('admin', 'lead', 'member')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

/**
 * Middleware ensuring the authenticated user is an Admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware ensuring the authenticated user is a Team Lead or Admin
 */
export const requireLeadOrAdmin = requireRole('lead', 'admin');
