const User = require('../models/user.model');
const ApartmentUnit = require('../models/Apartment.Unit.model');
const ApartmentBuilding = require('../models/Apartment.Building.model'); // if you need to populate

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password') // Exclude password
      .populate('tenant_details.apartment'); // Get apartment details
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Permission check - only admin, self, or manager can view
    if (req.user.role !== 'admin' && 
        req.user.userId !== user._id.toString() &&
        !(req.user.role === 'manager' && user.role === 'tenant')) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view all users' });
    }
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
      
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    // Don't allow password updates through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }
    
    // Don't allow role changes unless admin
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }
    
    // Check authorization - user can update themselves, admin can update anyone
    const userId = req.params.id;
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Get tenant details including apartment
exports.getTenantDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username first_name last_name email role tenant_details')
      .populate('tenant_details.apartment');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'tenant') {
      return res.status(400).json({ message: 'User is not a tenant' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenant details', error: error.message });
  }
};

// Create new user (updated for unit-based tenant assignment)
exports.createUser = async (req, res) => {
  try {
    // Only admin or manager can create users
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only admin or manager can create users' });
    }

    // If manager, can only create tenants for their units
    if (req.user.role === 'manager') {
      if (req.body.role !== 'tenant') {
        return res.status(403).json({ message: 'Managers can only create tenants' });
      }
      if (!req.body.unit) {
        return res.status(400).json({ message: 'Tenant must be assigned to a unit' });
      }
      // Validate unit and manager relationship
      const unit = await ApartmentUnit.findById(req.body.unit).populate('building');
      if (!unit) {
        return res.status(400).json({ message: 'Invalid unit' });
      }
      console.log('DEBUG: unit.building.manager =', unit.building.manager, 'req.user._id =', req.user._id);
      console.log('DEBUG: unit.building._id =', unit.building._id, 'unit._id =', unit._id);
      if (!unit.building || String(unit.building.manager) !== String(req.user.userId)) {
        return res.status(403).json({ message: 'You can only add tenants to your own buildings' });
      }
      // Optionally check if unit is already occupied
      if (unit.status === 'occupied' || unit.isOccupied) {
        return res.status(400).json({ message: 'Unit already occupied' });
      }
      // Attach unit to tenant
      req.body.unit = unit._id;
    }

    // If creating a manager, do NOT require apartment/unit
    if (req.body.role === 'manager') {
      delete req.body.apartment;
      delete req.body.unit;
    }

    // Add created_by field from authenticated user
    const userData = {
      ...req.body,
      created_by: req.user.userId
    };

    // Create the tenant
    const user = await User.create(userData);

    // If tenant, update the unit to mark as occupied and add tenant
    if (user.role === 'tenant' && user.unit) {
      await ApartmentUnit.findByIdAndUpdate(
        user.unit,
        {
          $push: { tenants: user._id },
          status: 'occupied',
          isOccupied: true
        }
      );
    }

    res.status(201).json(user);
  } catch (error) {
    console.error('User creation error:', error.message, req.body);
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Managers can view tenants in their own building's units
exports.getManagerTenants = async (req, res) => {
  try {
    // Find the building managed by this manager
    const building = await ApartmentBuilding.findOne({ manager: req.user.userId }).select('_id');
    if (!building) {
      return res.status(400).json({ message: 'Manager does not have a building assigned.' });
    }

    // Find all units in that building
    const units = await ApartmentUnit.find({ building: building._id }).select('_id');
    const unitIds = units.map(u => u._id);

    // Find all tenants assigned to those units
    const tenants = await User.find({
      role: 'tenant',
      unit: { $in: unitIds }
    }).select('-password');

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants', error: error.message });
  }
};