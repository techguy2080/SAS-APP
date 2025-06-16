const express = require('express');
const router = express.Router();
const passport = require('passport');
const apartmentController = require('../controllers/Apartment.Unit.Controller');
const cache = require('../middleware/cache');

// Get all apartment units (admin)
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  cache('apartments', 60),
  apartmentController.getAllApartments
);

// Get amenities list (static content)
router.get(
  '/amenities',
  passport.authenticate('jwt', { session: false }),
  cache('static', 86400),
  apartmentController.getAmenities
);

// Create apartment unit (admin)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  apartmentController.createApartment
);

// Get all units managed by the current manager
router.get(
  '/manager',
  passport.authenticate('jwt', { session: false }),
  apartmentController.getManagerApartments
);

// Get the unit for the current tenant
router.get(
  '/tenant',
  passport.authenticate('jwt', { session: false }),
  cache('apartments', 60),
  apartmentController.getTenantApartment
);

// Manager: Assign tenant to a unit
router.post(
  '/add-tenant',
  passport.authenticate('jwt', { session: false }),
  apartmentController.addTenant
);

// Update apartment unit (admin or manager, add role check if needed)
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  apartmentController.updateApartment
);

// Delete apartment unit (admin only, add role check if needed)
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  apartmentController.deleteApartment
);

// Get apartment unit by ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  apartmentController.getApartmentById
);

module.exports = router;