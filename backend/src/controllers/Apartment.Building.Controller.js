const ApartmentBuilding = require('../models/Apartment.Building.model');

// Get all buildings
exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await ApartmentBuilding.find().populate('manager');
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buildings', error: error.message });
  }
};

// Get a single building by ID
exports.getBuildingById = async (req, res) => {
  try {
    const building = await ApartmentBuilding.findById(req.params.id).populate('manager');
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.json(building);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching building', error: error.message });
  }
};

// Get all buildings managed by a specific manager
exports.getBuildingsByManager = async (req, res) => {
  try {
    const buildings = await ApartmentBuilding.find({ manager: req.params.managerId }).populate('manager', 'firstName lastName email');
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buildings for manager', error: error.message });
  }
};

// Create a new building
exports.createBuilding = async (req, res) => {
  try {
    // req.body fields are strings when using multer
    const { name, address, manager, totalUnits, amenities, notes } = req.body;

    if (!name || !address || !manager) {
      return res.status(400).json({ message: 'Name, address, and manager are required.' });
    }

    // Parse amenities if it's a stringified array
    let amenitiesArray = [];
    if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    } else if (typeof amenities === 'string' && amenities.trim() !== '') {
      try {
        amenitiesArray = JSON.parse(amenities);
      } catch {
        amenitiesArray = [amenities];
      }
    }

    // Handle images from req.files (if any)
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => file.path || file.filename || file.originalname);
    }

    const building = new ApartmentBuilding({
      name,
      address,
      amenities: amenitiesArray,
      manager,
      images: imagePaths,
      notes,
      totalUnits
    });

    await building.save();
    res.status(201).json(building);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.manager) {
      return res.status(400).json({ message: 'This manager is already assigned to another building.' });
    }
    res.status(500).json({ message: 'Error creating building', error: error.message });
  }
};

// Update a building
exports.updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const building = await ApartmentBuilding.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.json(building);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.manager) {
      return res.status(400).json({ message: 'This manager is already assigned to another building.' });
    }
    res.status(500).json({ message: 'Error updating building', error: error.message });
  }
};

// Delete a building
exports.deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await ApartmentBuilding.findByIdAndDelete(id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.json({ message: 'Building deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting building', error: error.message });
  }
};