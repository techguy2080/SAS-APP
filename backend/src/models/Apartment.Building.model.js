const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApartmentBuildingSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  amenities: [{ type: String }],
  manager: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // <-- unique here
  images: [{ type: String }],
  notes: { type: String },
  totalUnits: { type: Number, default: 0 } 
}, { timestamps: true });

ApartmentBuildingSchema.pre('save', async function(next) {
  if (!this.isModified('manager')) return next();
  const existing = await mongoose.models.ApartmentBuilding.findOne({ manager: this.manager, _id: { $ne: this._id } });
  if (existing) {
    return next(new Error('This manager is already assigned to another building.'));
  }
  next();
});

module.exports = mongoose.models.ApartmentBuilding || mongoose.model('ApartmentBuilding', ApartmentBuildingSchema);