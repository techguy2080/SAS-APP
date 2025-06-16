const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'tenant'],
    required: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true,
    trim: true
  },
  // Add this apartment field for managers
  apartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Apartment',
    required: function() {
      return this.role === 'tenant' && !this.unit;
    }
  },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentUnit' }, // <-- Add this
  tenant_details: {
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' },
    lease_start: { type: Date },
    lease_end: { type: Date }
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'manager' || this.role === 'tenant';
    }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Debug password comparison:', {
      candidatePassword,
      storedHash: this.password,
      bcryptVersion: bcrypt.version || 'unknown'
    });

    // Test if bcrypt can generate a hash
    const testHash = await bcrypt.hash(candidatePassword, 12);
    console.log('Test hash generated:', testHash);

    // Compare the candidate password with the stored hash
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);

    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;