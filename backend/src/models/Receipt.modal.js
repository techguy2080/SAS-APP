const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, unique: true },
  receiptNumber: { type: String, required: true, unique: true },
  issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // tenant
  apartmentUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentUnit', required: true },
  amount: { type: Number, required: true },
  type: { // Match Payment type
    type: String,
    enum: [
      'rent', 
      'security', 
      'utility', 
      'maintenance', 
      'deposit', 
      'parking', 
      'penalty', 
      'service', 
      'insurance', 
      'internet', 
      'water', 
      'electricity', 
      'garbage', 
      'other'
    ],
    required: true
  },
  reference: { type: String }, // e.g. transaction ID from payment gateway
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'mpesa', 'cheque', 'card', 'other'], 
    default: 'cash' 
  },
  issuedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // manager/admin who issued
  notes: { type: String }
});

module.exports = mongoose.model('Receipt', receiptSchema);