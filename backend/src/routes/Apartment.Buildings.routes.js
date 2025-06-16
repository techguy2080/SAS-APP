const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const upload = multer(); // Use memory storage or configure as needed
const buildingController = require('../controllers/Apartment.Building.Controller');

// Get all buildings
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  buildingController.getAllBuildings
);

// Get a single building by ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  buildingController.getBuildingById
);

// Get all buildings managed by a specific manager
router.get(
  '/manager/:managerId',
  passport.authenticate('jwt', { session: false }),
  buildingController.getBuildingsByManager
);

// Create a new building (with file upload support)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.any(), // Handles multipart/form-data
  buildingController.createBuilding
);

// Update a building (with file upload support)
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  upload.any(), // Handles multipart/form-data
  buildingController.updateBuilding
);

// Delete a building
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  buildingController.deleteBuilding
);

module.exports = router;