const Document = require('../models/Document.model');
const Building = require('../models/Apartment.Building.model');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req) => {
  try {
    const { originalname, mimetype, size, filename } = req.file;
    // Add all fields you use below:
    const { category, description, tenant, building, unit } = req.body;
    const filePath = `/uploads/${category}/${filename}`;
    console.log('📝 Will save filePath in DB as:', filePath);

    if (req.user.role === 'manager' && building) {
      const managedBuilding = await Building.findOne({
        _id: building,
        manager: req.user.userId || req.user._id
      });
      if (!managedBuilding) {
        // Clean up the file if validation fails
        if (fs.existsSync(req.file.path)) {
          console.log('🧹 Cleaning up rejected file:', req.file.path);
          fs.unlinkSync(req.file.path);
        }
        throw new Error('You can only upload documents for buildings you manage');
      }
    }

    const document = new Document({
      name: originalname,
      description: description || '',
      fileType: mimetype,
      fileSize: size,
      filePath,
      category,
      tenant: tenant || null,
      building: building || null,
      unit: unit || null,
      uploadedBy: req.user.userId || req.user._id
    });

    await document.save();
    return document;
  } catch (error) {
    // Clean up file if there's an error during save
    if (req.file && fs.existsSync(req.file.path)) {
      console.log('🧹 Cleaning up file due to error:', req.file.path);
      fs.unlinkSync(req.file.path);
    }
    throw error; // Re-throw the error to be handled by the controller
  }
};

exports.getDocuments = async (req) => {
  // ...move your getDocuments logic here, return documents array
};

exports.getDocumentById = async (req) => {
  // ...move your getDocumentById logic here, return document
};

exports.downloadDocument = async (id, req) => {
  const document = await Document.findById(id);
  if (!document) {
    throw new Error('Document not found');
  }

  // Add authorization checks
  if (req.user.role === 'manager' && document.building) {
    const managedBuilding = await Building.findOne({
      _id: document.building,
      manager: req.user._id
    });
    
    if (!managedBuilding && document.uploadedBy.toString() !== req.user._id.toString()) {
      throw new Error('Not authorized to download this document');
    }
  }

  // Fix: Go up TWO directories (to backend, not just src)
  const filePath = path.join(__dirname, '../..', document.filePath.replace(/^\/+/, ''));
  console.log('🔍 Looking for file at:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found on server:', filePath);
    throw new Error('File not found on server');
  }

  return { document, filePath };
};

exports.deleteDocument = async (req) => {
  // ...move your deleteDocument logic here, return deleted document or status
};