const express = require('express');
const router = express.Router();
const documentController = require('../controllers/Document.Controller');
const auth = require('../middleware/auth.middleware'); // Correct path
const upload = require('../middleware/fileUpload'); // adjust path if needed
const roleCheck = require('../middleware/roleCheck.middleware'); // Correct path

// All document routes require authentication
router.use(auth);

// Routes with permissions
router.post(
  '/',
  roleCheck(['admin', 'manager']),
  upload.single('file'), 
  documentController.uploadDocument
);

router.get('/', documentController.getDocuments);
router.get('/expiring', documentController.getExpiringDocuments);
router.get('/:id', documentController.getDocumentById);
router.get('/download/:id', documentController.downloadDocument);

router.put(
  '/:id',
  roleCheck(['admin', 'manager']),
  documentController.updateDocument
);

router.post(
  '/:id/versions',
  roleCheck(['admin', 'manager']),
  upload.single('file'),
  documentController.createNewVersion
);

router.delete(
  '/:id',
  roleCheck(['admin', 'manager']),
  documentController.deleteDocument
);

module.exports = router;