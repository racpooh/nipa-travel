const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 25,              // Reduced from 100 - more realistic
  queueLimit: 0,                    // Keep this
  
  // Timeout settings (corrected names)
  acquireTimeout: 60000,            // Time to wait for connection from pool
  timeout: 60000,                   // Query timeout
  
  // Connection management
  idleTimeout: 300000,              // 5 minutes
  maxIdle: 5,                       // Reduced from 20
  
  // Connection quality settings
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // Remove these - they cause warnings:
  // reconnect: true,               // ❌ Not needed in mysql2
  
  // Optional: Add SSL if your database requires it
  // ssl: {
  //   rejectUnauthorized: false
  // }
};

const pool = mysql.createPool(dbConfig);

// Enhanced connection test with better error handling
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    console.log(`Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    console.log(`Pool stats: limit=${dbConfig.connectionLimit}, queue=${dbConfig.queueLimit}`);
    
    // Test a simple query
    await connection.execute('SELECT 1 as test');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

// Add pool event listeners for monitoring
pool.on('connection', function (connection) {
  console.log('New connection established as id ' + connection.threadId);
});

pool.on('error', function(err) {
  console.error('Database pool error:', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed.');
  }
  if(err.code === 'ER_CON_COUNT_ERROR') {
    console.log('Database has too many connections.');
  }
  if(err.code === 'ECONNREFUSED') {
    console.log('Database connection was refused.');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

module.exports = { pool, testConnection };