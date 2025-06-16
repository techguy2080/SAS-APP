require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('./middleware/passport')(passport);
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cache = require('./middleware/cache');
const path = require('path'); // Add this at the top with other requires

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(passport.initialize()); 

// Rate limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Import and register routes
const authRoutes = require('./routes/auth.routes');
const apartmentUnitRoutes = require('./routes/Apartment.Units.routes');
const apartmentBuildingRoutes = require('./routes/Apartment.Buildings.routes');
const userRoutes = require('./routes/user.routes');
const documentRoutes = require('./routes/Document.routes'); // Add this line with your other route imports
const receiptRoutes = require('./routes/Recepts.route'); // <-- updated to match 'Recepts.route'

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Register the upload route
const uploadRoutes = require('./routes/upload.routes');

app.use('/api/auth', authRoutes);
app.use('/api/apartment-units', apartmentUnitRoutes);
app.use('/api/apartment-buildings', apartmentBuildingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes); // Add this line with your other app.use statements
app.use('/api/payments', require('./routes/payments.routes')); // Add this line for payments routes
app.use('/api/receipts', receiptRoutes); // This line stays the same

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/kidega-apartments';
console.log(`Attempting MongoDB connection to: ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`Connected to MongoDB at ${MONGODB_URI}`))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Port logic (safe increment, max 65535)
let port = parseInt(process.env.PORT, 10) || 5001;
const startServer = (portToTry) => {
  if (portToTry > 65535) {
    console.error('No available ports below 65536. Exiting.');
    process.exit(1);
  }
  app.listen(portToTry, '0.0.0.0', () => {
    console.log(`Server running on port ${portToTry}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToTry} is busy, trying ${portToTry + 1}`);
      startServer(portToTry + 1);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
};

// Apply cache middleware to specific routes
app.use('/api/apartment-units/tenant', cache('apartments', 60));

startServer(port);