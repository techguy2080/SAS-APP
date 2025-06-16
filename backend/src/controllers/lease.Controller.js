const User = require('../models/user.model');
const Apartment = require('../models/Apartment.model');

// Get upcoming lease expirations
exports.getUpcomingExpirations = async (req, res) => {
  try {
    // Only managers and admins can view
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const query = {
      'tenant_details.lease_end': { 
        $gte: new Date(), 
        $lte: thirtyDaysFromNow 
      }
    };
    
    // If manager, only show their tenants
    if (req.user.role === 'manager') {
      query.created_by = req.user.userId;
    }
    
    const expiringLeases = await User.find(query)
      .select('username first_name last_name tenant_details')
      .populate('tenant_details.apartment');
      
    res.json(expiringLeases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lease expirations', error: error.message });
  }
};

// Renew a tenant's lease
exports.renewLease = async (req, res) => {
  try {
    const { tenantId, newEndDate } = req.body;
    
    const tenant = await User.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    
    // Ensure proper authorization
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'manager' || tenant.created_by.toString() !== req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to renew this lease' });
    }
    
    // Update the lease end date
    tenant.tenant_details.lease_end = newEndDate;
    await tenant.save();
    
    res.json({ 
      message: 'Lease renewed successfully',
      tenant: {
        id: tenant._id,
        name: `${tenant.first_name} ${tenant.last_name}`,
        lease_end: tenant.tenant_details.lease_end
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error renewing lease', error: error.message });
  }
};