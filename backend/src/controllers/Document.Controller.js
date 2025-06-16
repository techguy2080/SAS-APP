const Document = require('../models/Document.model');
const Building = require('../models/Apartment.Building.model');
const fs = require('fs');
const path = require('path');
const documentService = require('../services/document.service');

// Helper function to consistently get user ID
const getUserId = (user) => user?.userId || user?._id;

// Upload a new document - already restricted by roleCheck middleware
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      console.error('❌ No file uploaded. req.file:', req.file);
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('✅ Uploaded file:', req.file);
    const document = await documentService.uploadDocument(req);
    console.log('✅ Document saved to DB:', document);

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Return 403 for permission errors
    if (error.message === 'You can only upload documents for buildings you manage') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: error.message || 'Failed to upload document' });
  }
};

// Get all documents with role-based filtering
exports.getDocuments = async (req, res) => {
  try {
    const { category, tenant, building, unit, status, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (tenant) filter.tenant = tenant;
    if (building) filter.building = building;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;
    
    // Text search if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role-based access control
    if (req.user.role === 'admin') {
      // Admin can see all documents - no additional filtering
    } 
    else if (req.user.role === 'manager') {
      const managedBuildings = await Building.find({ 
        manager: getUserId(req.user)  // Updated
      }).select('_id');
      const buildingIds = managedBuildings.map(b => b._id);
      
      // Manager can only see documents for their buildings
      filter.$or = [
        { building: { $in: buildingIds } },
        { uploadedBy: getUserId(req.user) }  // Updated
      ];
    } 
    else if (req.user.role === 'tenant') {
      // Tenants can only see their own documents
      filter.tenant = getUserId(req.user);  // Updated
    }
    
    const documents = await Document.find(filter)
      .populate('uploadedBy', 'first_name last_name')
      .populate('tenant', 'first_name last_name')
      .populate('building', 'name')
      .populate('unit', 'unitNumber')
      .sort({ uploadedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

// Get a single document by ID - with role-based access
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'first_name last_name')
      .populate('tenant', 'first_name last_name')
      .populate('building', 'name')
      .populate('unit', 'unitNumber');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check authorization
    if (req.user.role === 'admin') {
      // Admin can access any document
    }
    else if (req.user.role === 'manager') {
      // Check if document belongs to a building managed by this manager
      if (document.building) {
        const managedBuilding = await Building.findOne({ 
          _id: document.building._id || document.building,
          manager: getUserId(req.user)  // FIX: Add userId fallback!
        });
        
        if (!managedBuilding && document.uploadedBy.toString() !== getUserId(req.user).toString()) {
          // FIX: Use userId fallback! ☝️
          return res.status(403).json({ 
            message: 'Not authorized to access this document' 
          });
        }
      }
      // If document has no building but was uploaded by someone else, deny access
      else if (document.uploadedBy.toString() !== getUserId(req.user).toString()) {
        // FIX: Use userId fallback! ☝️
        return res.status(403).json({ 
          message: 'Not authorized to access this document' 
        });
      }
    } 
    else if (req.user.role === 'tenant') {
      // Tenants can only see their own documents
      if (!document.tenant || document.tenant._id.toString() !== getUserId(req.user).toString()) {
        return res.status(403).json({ 
          message: 'Not authorized to access this document' 
        });
      }
    }
    
    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
};

// Download a document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      console.error('❌ Document not found in DB for ID:', req.params.id);
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization - same logic as getDocumentById
    if (req.user.role === 'admin') {
      // Admin can download any document
    }
    else if (req.user.role === 'manager') {
      // Check if document belongs to a building managed by this manager
      if (document.building) {
        const managedBuilding = await Building.findOne({ 
          _id: document.building,
          manager: getUserId(req.user)  // Updated
        });
        
        if (!managedBuilding && document.uploadedBy.toString() !== getUserId(req.user).toString()) {
          return res.status(403).json({ 
            message: 'Not authorized to download this document' 
          });
        }
      }
      // If document has no building but was uploaded by someone else, deny access
      else if (document.uploadedBy.toString() !== getUserId(req.user).toString()) {
        return res.status(403).json({ 
          message: 'Not authorized to download this document' 
        });
      }
    } 
    else if (req.user.role === 'tenant') {
      // Tenants can only download their own documents
      if (!document.tenant || document.tenant.toString() !== getUserId(req.user).toString()) {
        return res.status(403).json({ 
          message: 'Not authorized to download this document' 
        });
      }
    }
    
    const filePath = path.join(__dirname, '../..', document.filePath.replace(/^\/+/, ''));
    console.log('🔍 Looking for file at:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found on server:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    console.log('✅ File found, streaming:', filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    res.setHeader('Content-Type', document.fileType);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('❌ Download document error:', error);
    res.status(500).json({ message: 'Failed to download document' });
  }
};

// Update document metadata
exports.updateDocument = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, description, category, tenant, building, unit, status, expiryDate } = body;
    console.log('🔍 Update requested for document:', req.params.id);
    console.log('🔍 Update requested by user:', req.user._id, 'role:', req.user.role);
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      console.log('❌ Document not found');
      return res.status(404).json({ message: 'Document not found' });
    }
    
    console.log('✅ Document found:', document._id);
    console.log('📄 Document details:', {
      building: document.building,
      uploadedBy: document.uploadedBy
    });
    
    // Check if user has permission to update this document
    if (req.user.role === 'manager') {
      console.log('👮 Checking manager permissions...');
      
      // Managers can only update documents for their buildings
      if (document.building) {
        console.log('🏢 Document has building:', document.building);
        console.log('👤 Looking for building with manager:', getUserId(req.user));
        
        // FIX: Use userId fallback like in other methods
        const managedBuilding = await Building.findOne({ 
          _id: document.building,
          manager: getUserId(req.user)  // Add userId fallback!
        });
        
        console.log('🏢 Managed building found:', !!managedBuilding);
        
        // Safely check IDs with null guards
        const userIdStr = getUserId(req.user) ? getUserId(req.user).toString() : '';
        const uploadedByStr = document.uploadedBy ? document.uploadedBy.toString() : '';
        
        console.log('🔍 Comparing IDs:', {
          userIdStr,
          uploadedByStr,
          match: uploadedByStr === userIdStr
        });
        
        if (!managedBuilding && uploadedByStr !== userIdStr) {
          console.log('❌ Not authorized: Not building manager AND not document creator');
          return res.status(403).json({ 
            message: 'Not authorized to update this document' 
          });
        }
      }
      // If document has no building but was uploaded by someone else, deny access
      else if (document.uploadedBy && req.user._id) {
        // Safely compare with null checks
        const userIdStr = getUserId(req.user).toString();
        const uploadedByStr = document.uploadedBy.toString();
        
        if (uploadedByStr !== userIdStr) {
          return res.status(403).json({ 
            message: 'Not authorized to update this document' 
          });
        }
      }
      
      // Managers can't change a document to a building they don't manage
      if (building) {
        const currentBuildingId = document.building ? document.building.toString() : null;
        
        if (building !== currentBuildingId) {
          const managedBuilding = await Building.findOne({ 
            _id: building,
            manager: getUserId(req.user) 
          });
          
          if (!managedBuilding) {
            return res.status(403).json({ 
              message: 'You can only assign documents to buildings you manage' 
            });
          }
        }
      }
    }
    
    // Update fields
    if (name) document.name = name;
    if (description) document.description = description;
    if (category) document.category = category;
    if (status) document.status = status;
    if (expiryDate) document.expiryDate = expiryDate;
    
    // Only admins can reassign documents to different entities
    if (req.user.role === 'admin') {
      if (tenant) document.tenant = tenant;
      if (building) document.building = building;
      if (unit) document.unit = unit;
    }
    
    document.lastModified = Date.now();
    
    await document.save();
    
    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
};

// Delete operation should also be restricted
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user has permission to delete this document
    if (req.user.role === 'manager') {
      // Managers can only delete documents for their buildings
      if (document.building) {
        const managedBuilding = await Building.findOne({ 
          _id: document.building,
          manager: getUserId(req.user)  // Updated
        });
        
        if (!managedBuilding && document.uploadedBy.toString() !== getUserId(req.user).toString()) {
          return res.status(403).json({ 
            message: 'Not authorized to delete this document' 
          });
        }
      }
      // If document has no building but was uploaded by someone else, deny access
      else if (document.uploadedBy.toString() !== getUserId(req.user).toString()) {
        return res.status(403).json({ 
          message: 'Not authorized to delete this document' 
        });
      }
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../..', document.filePath.replace(/^\/+/, ''));
    console.log('Looking for file at:', filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from database
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
};

// Get documents expiring in the next 30 days
exports.getExpiringDocuments = async (req, res) => {
  try {
    // Find documents expiring in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringDocs = await Document.find({
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
      status: 'active'
    })
    .populate('building unit tenant')
    .sort({ expiryDate: 1 });
    
    res.json(expiringDocs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expiring documents' });
  }
};

// Create a new version of a document
exports.createNewVersion = async (req, res) => {
  try {
    const oldDoc = await Document.findById(req.params.id);
    if (!oldDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Set old version as inactive
    oldDoc.isActive = false;
    await oldDoc.save();
    
    // Create new version with incremented version number
    const newDocData = {
      ...req.body,
      version: oldDoc.version + 1,
      // Keep references to related entities
      tenant: oldDoc.tenant,
      building: oldDoc.building,
      unit: oldDoc.unit,
      uploadedBy: req.user._id
    };
    
    const newDoc = new Document(newDocData);
    await newDoc.save();
    
    res.status(201).json({
      message: 'New version created',
      document: newDoc
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating new version' });
  }
};