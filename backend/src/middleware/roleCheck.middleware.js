module.exports = (requiredRoles) => {
  return (req, res, next) => {
    console.log("Role check for:", req.path, "User role:", req.user.role);
    console.log("Allowed roles:", requiredRoles);
    try {
      if (!requiredRoles.includes(req.user.role)) {
        console.log("Role check failed");
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }
      console.log("Role check passed");
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking permissions', error: error.message });
    }
  };
};