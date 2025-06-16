const Payment = require('../models/Payment.model');
const ApartmentUnit = require('../models/Apartment.Unit.model'); // Needed for building lookup
const roleCheck = require('../middleware/roleCheck.middleware');

exports.createPayment = async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can record payments.' });
  }
  try {
    // Optionally, ensure manager can only add for their building/unit
    // (Assumes req.user.building or req.user._id is available)
    const payment = await Payment.create({ ...req.body, recordedBy: req.user._id });
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'manager') {
      const units = await ApartmentUnit.find({ building: req.user.building }).select('_id').lean();
      filter.unit = { $in: units.map(u => u._id) };
    } else if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    }
    // Admin sees all
    const payments = await Payment.find(filter)
      .populate('tenant', 'first_name last_name email')
      .populate('unit', 'unitNumber building');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('tenant unit');
  if (!payment) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'manager') {
    // Check if payment's unit is in manager's building
    const unit = await ApartmentUnit.findById(payment.unit);
    if (!unit || String(unit.building) !== String(req.user.building)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  } else if (req.user.role === 'tenant') {
    if (String(payment.tenant) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  // Admin can view all
  res.json(payment);
};

exports.updatePayment = async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can update payments.' });
  }
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!payment) return res.status(404).json({ error: 'Not found' });
  res.json(payment);
};