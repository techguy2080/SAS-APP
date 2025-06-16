const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../config/config');
const User = require('../models/user.model');
const Apartment = require('../models/Apartment.Unit.model');
const logAuthEvent = require('../utils/auditLogger');
const { validationResult } = require('express-validator');

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, is_active: true });
    if (!user) {
      logAuthEvent(`FAILED LOGIN: username=${username} (user not found)`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logAuthEvent(`FAILED LOGIN: username=${username} (wrong password)`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logAuthEvent(`SUCCESSFUL LOGIN: username=${username}, role=${user.role}`);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, apartment: user.apartment }, // <-- add apartment here
      JWT_SECRET,
      { expiresIn: '30m' } // 30 minutes
    );

    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role, apartment: user.apartment }, // <-- add apartment here
      JWT_SECRET,
      { expiresIn: '7d' } // 7 days
    );

    // Set refresh token as cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // false for development
      sameSite: 'lax', // less strict for development
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    console.log('Cookie set:', {
      refreshToken: refreshToken.substring(0, 20) + '...',
      options: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      }
    });

    // Send response
    res.json({
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, password, role, email, first_name, last_name, phone_number } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters, include a number and an uppercase letter.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const user = new User({
      username,
      password, // let the model's pre-save hook hash it
      role,
      email,
      first_name,
      last_name,
      phone_number,
      is_active: true,
      created_at: new Date()
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Create Manager
exports.createManager = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone_number } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const manager = new User({
      username,
      email,
      password,
      role: 'manager',
      first_name,
      last_name,
      phone_number,
      created_by: req.user.userId
    });

    await manager.save();

    res.status(201).json({
      message: 'Manager created successfully',
      manager: {
        id: manager._id,
        username: manager.username,
        email: manager.email,
        role: manager.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating manager', error: error.message });
  }
};

// Create Tenant
exports.createTenant = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can create tenants' });
    }
    
    const { 
      username, email, password, first_name, last_name, 
      phone_number, apartmentId, lease_start, lease_end 
    } = req.body;

    // Verify apartment exists and manager is assigned to it
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    
    if (!apartment.manager.equals(req.user.userId)) {
      return res.status(403).json({ 
        message: 'You can only assign tenants to apartments you manage' 
      });
    }
    
    // Create the tenant user
    const tenant = new User({
      username,
      email,
      password,
      role: 'tenant',
      first_name,
      last_name,
      phone_number,
      created_by: req.user.userId,
      tenant_details: {
        apartment: apartmentId,
        lease_start,
        lease_end
      }
    });
    
    await tenant.save();
    
    // Update the apartment to include this tenant
    apartment.tenants.push(tenant._id);
    apartment.status = 'occupied';
    apartment.isOccupied = true;
    await apartment.save();
    
    res.status(201).json({ 
      message: 'Tenant created and assigned to apartment successfully',
      tenant: {
        id: tenant._id,
        username: tenant.username,
        email: tenant.email,
        role: tenant.role
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error creating tenant', error: error.message });
  }
};

// Profile
exports.profile = async (req, res) => {
  try {
    // req.user is set by passport after token verification
    const user = await User.findById(req.user.userId)
      .select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

// Get All Users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Refresh Token
exports.refreshToken = (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }

      // Issue a new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId, role: decoded.role },
        JWT_SECRET,
        { expiresIn: '30m' }
      );

      res.json({ token: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing token', error: error.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};