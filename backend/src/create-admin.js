const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/kidega-apartments';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get the User model - adjust path if needed
    const User = mongoose.model('User') || 
                 require('./models/user.model');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('\n⚠️ Admin user already exists:');
      console.log(`ID: ${existingAdmin._id}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log('Try logging in with this email and "Admin123" password');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Admin123', 10);
      
      const newAdmin = new User({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      
      await newAdmin.save();
      
      console.log('\n✅ New admin user created:');
      console.log(`ID: ${newAdmin._id}`);
      console.log(`Email: ${newAdmin.email}`);
      console.log(`Password: Admin123`);
      console.log('\nTry logging in with these credentials');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });