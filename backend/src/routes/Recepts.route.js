const express = require('express');
const router = express.Router();
const passport = require('passport');
const receiptController = require('../controllers/receipt.Controller');
const roleCheck = require('../middleware/roleCheck.middleware');

// Allow admin, manager, and tenant to generate receipts (controller enforces permissions)
router.post('/',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin', 'manager', 'tenant']),
  receiptController.createReceipt
);

// All roles can view receipts, controller restricts data
router.get('/',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin', 'manager', 'tenant']),
  receiptController.getReceipts
);

router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin', 'manager', 'tenant']),
  receiptController.getReceiptById
);

router.get('/:id/download',
  passport.authenticate('jwt', { session: false }),
  roleCheck(['admin', 'manager', 'tenant']),
  receiptController.downloadReceipt
);

module.exports = router;