const Receipt = require('../models/Receipt.modal');
const Payment = require('../models/Payment.model');
const ApartmentUnit = require('../models/Apartment.Unit.model'); // Always use ApartmentUnit
const ApartmentBuilding = require('../models/Apartment.Building.model'); // Always use ApartmentBuilding
const PDFDocument = require('pdfkit');

// Helper to generate a unique receipt number (simple version)
const generateReceiptNumber = async () => {
  const count = await Receipt.countDocuments();
  return `RCT-${(count + 1).toString().padStart(6, '0')}`;
};

// Create/generate a receipt for a payment
exports.createReceipt = async (req, res) => {
  try {
    const { paymentId, notes } = req.body;
    const payment = await Payment.findById(paymentId).populate('tenant apartmentUnit');
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Only generate receipt for completed payments
    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Receipt can only be generated for completed payments.' });
    }

    // Prevent duplicate receipts for the same payment
    const existing = await Receipt.findOne({ payment: paymentId });
    if (existing) return res.status(400).json({ error: 'Receipt already exists for this payment.' });

    // Permission checks
    if (req.user.role === 'manager') {
      // Manager can only generate for their building(s)
      const apartmentUnit = await ApartmentUnit.findById(payment.apartmentUnit);
      if (!apartmentUnit) {
        return res.status(404).json({ error: 'Apartment unit not found.' });
      }
      const building = await ApartmentBuilding.findById(apartmentUnit.building);
      if (!building || String(building.manager) !== String(req.user._id)) {
        return res.status(403).json({ error: 'Managers can only generate receipts for their own building.' });
      }
    } else if (req.user.role === 'tenant') {
      // Tenant can only generate for their own apartment unit
      if (String(payment.tenant) !== String(req.user._id)) {
        return res.status(403).json({ error: 'Tenants can only generate receipts for their own payments.' });
      }
    }
    // Admin can generate for any payment

    const receiptNumber = await generateReceiptNumber();

    // Copy fields from Payment
    const receipt = await Receipt.create({
      payment: payment._id,
      receiptNumber,
      issuedTo: payment.tenant,
      apartmentUnit: payment.apartmentUnit,
      amount: payment.amount,
      type: payment.type, // Copy type
      reference: payment.reference, // Copy reference
      paymentMethod: payment.paymentMethod, // Copy payment method
      createdBy: req.user._id,
      notes
    });

    res.status(201).json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all receipts (admin/manager), or only own (tenant)
exports.getReceipts = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'tenant') {
      filter.issuedTo = req.user._id;
    }
    // Optionally, managers can filter by their building/apartmentUnit
    const receipts = await Receipt.find(filter)
      .populate('payment')
      .populate('issuedTo', 'first_name last_name email')
      .populate('apartmentUnit', 'unitNumber');
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single receipt by ID
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('payment')
      .populate('issuedTo', 'first_name last_name email')
      .populate('apartmentUnit', 'unitNumber');
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Only allow tenant to view their own receipt
    if (req.user.role === 'tenant' && String(receipt.issuedTo._id) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('payment')
      .populate('issuedTo', 'first_name last_name email')
      .populate('apartmentUnit', 'unitNumber');
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Permission check (same as getReceiptById)
    if (req.user.role === 'tenant' && String(receipt.issuedTo._id) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt Number: ${receipt.receiptNumber}`);
    doc.text(`Issued To: ${receipt.issuedTo.first_name} ${receipt.issuedTo.last_name}`);
    doc.text(`Apartment Unit: ${receipt.apartmentUnit.unitNumber}`);
    doc.text(`Amount: $${receipt.amount}`);
    doc.text(`Issued At: ${receipt.issuedAt.toLocaleDateString()}`);
    doc.text(`Notes: ${receipt.notes || '-'}`);
    doc.moveDown();
    doc.text('Thank you for your payment!', { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};