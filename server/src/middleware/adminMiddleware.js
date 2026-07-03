const protectAdmin = (req, res, next) => {
  const masterPassword = process.env.MASTER_ADMIN_PASSWORD || 'forgeadmin123';
  const providedPassword = req.headers['x-admin-password'] || req.query.adminPassword;

  if (!providedPassword || providedPassword !== masterPassword) {
    return res.status(403).json({ message: 'Forbidden: Invalid Admin Master Password' });
  }

  next();
};

module.exports = { protectAdmin };
