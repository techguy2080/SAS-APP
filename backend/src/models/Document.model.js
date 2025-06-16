const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  fileType: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'tenant_agreement', 
      'land_agreement', 
      'lease', 
      'maintenance', 
      'invoice',
      'property_deed',
      'title_document',
      'property_survey',
      'floor_plan',
      'contract',
      'legal_notice',
      'eviction_notice',
      'court_document',
      'tax_document',
      'insurance_policy',
      'mortgage_document',
      'payment_receipt',
      'financial_statement',
      'building_permit',
      'inspection_report',
      'certificate_of_occupancy',
      'construction_document',
      'renovation_plan',
      'service_contract',
      'vendor_agreement',
      'utility_agreement',
      'maintenance_log',
      'tenant_correspondence',
      'complaint_form',
      'incident_report',
      'other'
    ],
    required: true 
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'archived'],
    default: 'active'
  },
  expiryDate: {
    type: Date
  },
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  building: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ApartmentBuilding' 
  },
  unit: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ApartmentUnit' 
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'  // You might need to create this model
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

DocumentSchema.index({ category: 1 });
DocumentSchema.index({ tenant: 1 });
DocumentSchema.index({ building: 1 });
DocumentSchema.index({ unit: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ expiryDate: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ vendor: 1 });

module.exports = mongoose.model('Document', DocumentSchema);