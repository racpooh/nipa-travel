const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Import database functions
const { testConnection } = require('./config/db');
const { createTables } = require('./config/createTable');

const app = express();
const PORT = process.env.PORT || 5000;

console.log(process.env.PORT);

if (process.env.PORT) {
  console.log('PORT is set');
} else {
  console.log('PORT is not set');
}

const corsOptions = {
  origin: [
    'http://localhost:3000',  // Next.js default port
    'http://localhost:3001',  // Alternative port
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const initializeDatabase = async () => {
  await testConnection();
  await createTables();
};

// Initialize database on server start
initializeDatabase();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'NIPA Travel API Server is running!',
    version: '1.0.0',
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'nipa-travel-backend',
    version: '1.0.0'
  });
});

// Test database route
app.get('/api/check-tables', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    
    // Check what tables exist
    const [tables] = await pool.execute('SHOW TABLES');
    
    // Check users table structure
    const [usersStructure] = await pool.execute('DESCRIBE users');
    
    // Check bookings table structure  
    const [bookingsStructure] = await pool.execute('DESCRIBE bookings');
    
    // Count records
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [bookingCount] = await pool.execute('SELECT COUNT(*) as count FROM bookings');
    
    res.json({
      message: 'Database tables information',
      tables: tables,
      usersTable: {
        structure: usersStructure,
        count: userCount[0].count
      },
      bookingsTable: {
        structure: bookingsStructure,
        count: bookingCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error checking tables',
      error: error.message
    });
  }
});

// Handle malformed URLs from frontend - ADD THIS SECTION HERE
app.use('/api/auth/login:1', (req, res, next) => {
  console.log('Handling malformed URL: /api/auth/login:1');
  req.url = '/api/auth/login';
  req.originalUrl = '/api/auth/login';
  next();
});

app.use('/api/auth/login1', (req, res, next) => {
  console.log('Handling malformed URL: /api/auth/login1');
  req.url = '/api/auth/login';
  req.originalUrl = '/api/auth/login';
  next();
});

// Handle any other malformed auth URLs
app.use('/api/auth/*:*', (req, res, next) => {
  console.log('Handling malformed auth URL:', req.originalUrl);
  // Remove the :1 or similar suffixes
  const cleanUrl = req.originalUrl.replace(/:[\d]+$/, '');
  req.url = cleanUrl;
  req.originalUrl = cleanUrl;
  next();
});

// User authentication routes
app.use('/api/auth', require('./routes/auth'));

// Bookings routes
app.use('/api/bookings', require('./routes/bookings'));

// Weather routes
app.use('/api/weather', require('./routes/weather'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access server at: http://localhost:${PORT}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});