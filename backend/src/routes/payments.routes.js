const express = require('express');
const router = express.Router();
const passport = require('passport');
const paymentController = require('../controllers/payment.Controller');
const roleCheck = require('../middleware/roleCheck.middleware');

// Only managers can create or update payments
router.post('/', 
  passport.authenticate('jwt', { session: false }), 
  roleCheck(['manager']), 
  paymentController.createPayment
);

router.put('/:id', 
  passport.authenticate('jwt', { session: false }), 
  roleCheck(['manager']), 
  paymentController.updatePayment
);

// All roles can view payments, but controller restricts data returned
router.get('/', 
  passport.authenticate('jwt', { session: false }), 
  roleCheck(['admin', 'manager', 'tenant']), 
  paymentController.getPayments
);

router.get('/:id', 
  passport.authenticate('jwt', { session: false }), 
  roleCheck(['admin', 'manager', 'tenant']), 
  paymentController.getPaymentById
);

module.exports = router;