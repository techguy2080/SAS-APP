const express = require('express');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cache = require('./middleware/cache');

// All your route imports here
const authRoutes = require('./routes/auth.routes');
const apartmentUnitRoutes = require('./routes/Apartment.Units.routes');
const apartmentBuildingRoutes = require('./routes/Apartment.Buildings.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

require('./middleware/passport')(passport);

app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(passport.initialize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/apartment-units', apartmentUnitRoutes);
app.use('/api/apartment-buildings', apartmentBuildingRoutes);
app.use('/api/users', userRoutes);

module.exports = app;