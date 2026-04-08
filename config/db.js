const { Pool } = require('pg');
require('dotenv').config();

// SSL is controlled entirely by the DATABASE_URL via the standard `sslmode` query param.
// Examples:
//   postgres://user:pass@host:5432/db                    -> no SSL
//   postgres://user:pass@host:5432/db?sslmode=disable    -> no SSL
//   postgres://user:pass@host:5432/db?sslmode=require    -> SSL, no cert verification
//   postgres://user:pass@host:5432/db?sslmode=verify-full -> SSL, verify cert
// To switch databases, you only need to change DATABASE_URL in .env.
function resolveSsl(connectionString) {
    if (!connectionString) return false;
    let sslmode;
    try {
        sslmode = new URL(connectionString).searchParams.get('sslmode');
    } catch {
        sslmode = null;
    }
    switch (sslmode) {
        case 'require':
        case 'prefer':
            return { rejectUnauthorized: false };
        case 'verify-ca':
        case 'verify-full':
            return { rejectUnauthorized: true };
        case 'disable':
        case 'allow':
        case null:
        default:
            return false;
    }
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: resolveSsl(process.env.DATABASE_URL),
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
