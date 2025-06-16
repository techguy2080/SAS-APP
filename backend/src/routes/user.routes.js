const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user.Controller');
const roleCheck = require('../middleware/roleCheck.middleware');
const cache = require('../middleware/cache'); // Add this line
const auth = require('../middleware/auth.middleware');

console.log("user.routes.js loaded");

// Get all users (admin only)
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin']),
  cache('users', 60), // Add this line
  userController.getAllUsers
);

// Only managers can create tenants
router.post(
  '/',
  auth,
  userController.createUser
);

// Admins can create managers (and any user)
router.post(
  '/admin-create',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin']),
  userController.createUser
);

// Managers can view tenants in their own apartment
router.get(
  '/manager-tenants',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['manager']),
  userController.getManagerTenants
);

// Get user by ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  userController.getUserById
);

// Update user
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  userController.updateUser
);

// Get tenant details including apartment (for managers and admins)
router.get(
  '/:id/tenant-details',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin', 'manager']),
  userController.getTenantDetails
);

// Test route with no auth
router.post('/test', (req, res) => {
  console.log("Test POST route hit");
  res.json({ message: 'Test route works!' });
});

module.exports = router;