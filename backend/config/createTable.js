const { pool } = require('./db');

const createTables = async () => {
  try {
    // Users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Bookings table
    const createBookingsTable = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        departure_location VARCHAR(100) NOT NULL,
        destination_location VARCHAR(100) NOT NULL,
        departure_latitude DECIMAL(10, 8),
        departure_longitude DECIMAL(11, 8),
        destination_latitude DECIMAL(10, 8) NOT NULL,
        destination_longitude DECIMAL(11, 8) NOT NULL,
        flight_number VARCHAR(20) NOT NULL,
        departure_date DATE NOT NULL,
        departure_time TIME NOT NULL,
        arrival_date DATE,
        arrival_time TIME,
        seat_number VARCHAR(10),
        gate_number VARCHAR(10),
        ticket_price DECIMAL(10, 2),
        weather_forecast ENUM('Sunny', 'Cloudy', 'Rainy', 'Normal') DEFAULT 'Normal',
        weather_confirmed BOOLEAN DEFAULT FALSE,
        booking_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Execute table creation
    await pool.execute(createUsersTable);
    console.log('Users table created/verified');

    await pool.execute(createBookingsTable);
    console.log('Bookings table created/verified');

    // Create admin user if not exists
    const createAdminUser = `
      INSERT IGNORE INTO users (username, email, password, role)
      VALUES ('admin', 'admin@thailandtravel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
    `;
    
    await pool.execute(createAdminUser);
    console.log('Admin user created/verified (password: password)');

    console.log('All database tables setup completed!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

module.exports = { createTables };