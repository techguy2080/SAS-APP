const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApartmentUnitSchema = new Schema({
  building: { type: Schema.Types.ObjectId, ref: 'ApartmentBuilding', required: true }, // reference to building
  unitNumber: { type: String, required: true }, // e.g., "A-101"
  floor: { type: Number },
  numberOfRooms: { type: Number },
  numberOfBathrooms: { type: Number, default: 1 },
  sizeSqFt: { type: Number },
  rent: { type: Number },
  depositAmount: { type: Number },
  amenities: [{ type: String }],
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'maintenance', 'reserved'], 
    default: 'available'
  },
  isOccupied: { type: Boolean, default: false },
  images: [{ type: String }],
  floorPlan: { type: String },
  utilities: {
    waterIncluded: { type: Boolean, default: false },
    electricityIncluded: { type: Boolean, default: false },
    internetIncluded: { type: Boolean, default: false },
    gasIncluded: { type: Boolean, default: false }
  },
  parking: {
    available: { type: Boolean, default: false },
    spots: { type: Number, default: 0 },
    fee: { type: Number, default: 0 }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notes: { type: String },
  availableFrom: { type: Date },
  leaseTerm: { type: Number },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.models.ApartmentUnit || mongoose.model('ApartmentUnit', ApartmentUnitSchema);