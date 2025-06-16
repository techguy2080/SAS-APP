const express = require('express');
const router = express.Router();
const roleCheck = require('../middleware/roleCheck.middleware');
const authController = require('../controllers/auth.Controller');
const passport = require('passport');
const { body } = require('express-validator');
const userController = require('../controllers/user.Controller');

// Register
router.post(
  '/register',
  [
    body('username').isAlphanumeric().isLength({ min: 3, max: 20 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('first_name').isString().trim().escape(),
    body('last_name').isString().trim().escape(),
    body('phone_number').isMobilePhone()
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('username').isString().trim().escape(),
    body('password').isString()
  ],
  authController.login
);

// Refresh Token
router.post('/refresh-token', authController.refreshToken);

// Create manager (admin only)
router.post(
  '/create-manager',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin']),
  authController.createManager
);

// Create tenant (manager only)
router.post(
  '/create-tenant',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['manager']),
  [
    body('username').isAlphanumeric().isLength({ min: 3, max: 20 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('first_name').isString().trim().escape(),
    body('last_name').isString().trim().escape(),
    body('phone_number').isMobilePhone(),
    body('apartmentId').isMongoId(), // Validate MongoDB ID
    body('lease_start').optional().isISO8601(), // Date validation
    body('lease_end').optional().isISO8601()    // Date validation
  ],
  authController.createTenant
);

// Get user profile (protected route)
router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  authController.profile
);

// Get all users (admin only)
router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin']),
  authController.getAllUsers
);

// Logout
router.post('/logout', authController.logout);

// Get user by ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  userController.getUserById
);

module.exports = router;