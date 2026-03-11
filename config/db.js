const { Pool } = require('pg');
require('dotenv').config();

// Configure SSL based on environment
const sslConfig = process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false };

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
    // Don't exit immediately, allow for reconnection attempts
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection test failed:', err.message);
    } else {
        console.log('Database connection test successful:', res.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
