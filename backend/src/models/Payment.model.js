const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apartmentUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentUnit', required: true }, // <-- use apartmentUnit
  type: { 
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
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  reference: { type: String }, // e.g. transaction ID from payment gateway
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  notes: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'mpesa', 'cheque', 'card', 'other'], 
    default: 'cash' 
  },
});

module.exports = mongoose.model('Payment', paymentSchema);