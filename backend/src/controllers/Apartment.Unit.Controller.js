const ApartmentUnit = require('../models/Apartment.Unit.model');
const ApartmentBuilding = require('../models/Apartment.Building.model');
const User = require('../models/user.model');
const redis = require('../config/redis');

// Admin: Create apartment unit
exports.createApartment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create apartment units' });
    }
    const {
      building, // required
      unitNumber,
      floor,
      numberOfRooms,
      numberOfBathrooms,
      sizeSqFt,
      rent,
      depositAmount,
      amenities,
      status,
      isOccupied,
      images,
      floorPlan,
      utilities,
      parking,
      notes,
      availableFrom,
      leaseTerm,
      location,
      tenants
    } = req.body;

    if (!building) {
      return res.status(400).json({ message: 'Building is required for an apartment unit.' });
    }

    const apartmentUnit = await ApartmentUnit.create({
      building,
      unitNumber,
      floor,
      numberOfRooms,
      numberOfBathrooms,
      sizeSqFt,
      rent,
      depositAmount,
      amenities,
      status,
      isOccupied,
      images,
      floorPlan,
      utilities,
      parking,
      createdBy: req.user.userId,
      notes,
      availableFrom,
      leaseTerm,
      location,
      tenants
    });

    // Optionally update totalUnits in the building
    await ApartmentBuilding.findByIdAndUpdate(building, { $inc: { totalUnits: 1 } });

    await redis.del(redis.getKey('apartments', '/api/apartments'));
    res.status(201).json(apartmentUnit);
  } catch (error) {
    console.error('Create ApartmentUnit Error:', error);
    res.status(500).json({ message: 'Error creating apartment unit', error: error.message });
  }
};

// Manager: Get all apartment units in buildings they manage
exports.getManagerApartments = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can view their apartment units' });
    }
    // Find buildings managed by this manager
    const buildings = await ApartmentBuilding.find({ manager: req.user.userId }).select('_id');
    const buildingIds = buildings.map(b => b._id);
    // Find units in those buildings
    const apartments = await ApartmentUnit.find({ building: { $in: buildingIds } })
      .populate({
        path: 'building',
        populate: { path: 'manager', select: 'firstName lastName email' }
      });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment units', error: error.message });
  }
};

// Tenant: Get their apartment unit
exports.getTenantApartment = async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can view their apartment unit' });
    }
    const apartment = await ApartmentUnit.findOne({ tenants: req.user.userId })
      .populate({
        path: 'building',
        populate: { path: 'manager', select: 'firstName lastName email' }
      });
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment unit', error: error.message });
  }
};

// Manager: Assign tenant to their apartment unit
exports.addTenant = async (req, res) => {
  try {
    const { apartmentId, tenantId, leaseStart, leaseEnd } = req.body;
    const apartment = await ApartmentUnit.findById(apartmentId).populate('building');
    if (!apartment) return res.status(404).json({ message: 'Apartment unit not found' });

    // Only the manager of the building can add tenants
    if (
      req.user.role !== 'manager' ||
      !apartment.building.manager.equals(req.user.userId)
    ) {
      return res.status(403).json({ message: 'Only the assigned manager can add tenants' });
    }

    const tenant = await User.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    if (!apartment.tenants.includes(tenantId)) {
      apartment.tenants.push(tenantId);
      apartment.isOccupied = true;
      await apartment.save();
    }

    try {
      const updatedTenant = await User.findByIdAndUpdate(
        tenantId,
        {
          tenant_details: {
            apartment: apartmentId,
            lease_start: leaseStart,
            lease_end: leaseEnd
          }
        },
        { new: true, runValidators: true }
      );
      if (!updatedTenant) {
        return res.status(500).json({ message: 'Failed to update tenant record' });
      }
    } catch (saveError) {
      console.error('Error updating tenant:', saveError);
      return res.status(500).json({ message: 'Error updating tenant record', error: saveError.message });
    }

    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding tenant', error: error.message });
  }
};

// Update apartment unit details
exports.updateApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (update && !update.building) {
      return res.status(400).json({ message: 'Building is required for an apartment unit.' });
    }
    const apartment = await ApartmentUnit.findByIdAndUpdate(id, update, { new: true });
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment unit not found' });
    }

    await redis.del(redis.getKey('apartments', '/api/apartments'));
    await redis.del(redis.getKey('apartments', `/api/apartments/${id}`));
    if (apartment.tenant) {
      await redis.invalidateTenant(apartment.tenant);
    }

    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating apartment unit', error: error.message });
  }
};

// Delete apartment unit
exports.deleteApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await ApartmentUnit.findByIdAndDelete(id);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment unit not found' });
    }

    // Optionally decrement totalUnits in the building
    await ApartmentBuilding.findByIdAndUpdate(apartment.building, { $inc: { totalUnits: -1 } });

    await redis.del(redis.getKey('apartments', '/api/apartments'));

    res.json({ message: 'Apartment unit deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting apartment unit', error: error.message });
  }
};

// Get all apartment units - Admin only
exports.getAllApartments = async (req, res) => {
  try {
    const apartments = await ApartmentUnit.find()
      .populate({
        path: 'building',
        populate: { path: 'manager', select: 'firstName lastName email' }
      });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment units', error: error.message });
  }
};

// Get amenities list
exports.getAmenities = async (req, res) => {
  try {
    const amenities = ["Parking", "Pool", "Gym", "Laundry", "Security"];
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching amenities', error: error.message });
  }
};

// Cache middleware
const cacheMiddleware = (req, res, next) => {
  const key = redis.getKey('apartments', req.originalUrl);
  redis.get(key, (err, data) => {
    if (err) throw err;
    if (data) {
      console.log(`Cache hit for key: ${key}`);
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(data));
    } else {
      console.log(`Cache miss for key: ${key}`);
      res.set('X-Cache', 'MISS');
      res.json = (body) => {
        console.log(`Setting cache for key: ${key}`);
        redis.set(key, body, 'EX', 3600);
        return res.json(body);
      };
      next();
    }
  });
};

// Get apartment unit by ID
exports.getApartmentById = async (req, res) => {
  try {
    const apartment = await ApartmentUnit.findById(req.params.id).populate('building');
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment unit not found' });
    }
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment unit', error: error.message });
  }
};