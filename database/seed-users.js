const bcrypt = require('bcrypt');
const db = require('../config/db');

async function seedUsers() {
    try {
        // Ensure admins table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Admins table ready.');

        // 1. Admin: Rohin Khanna
        const adminPassword = await bcrypt.hash('rohin@123', 10);
        const adminResult = await db.query(
            `INSERT INTO admins (full_name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, full_name, email`,
            ['Rohin Khanna', 'rohin.khanna@dynat.in', adminPassword]
        );
        if (adminResult.rows.length > 0) {
            console.log('Admin created:', adminResult.rows[0]);
        } else {
            console.log('Admin rohin.khanna@dynat.in already exists, skipped.');
        }

        // 2. Normal user (doctor): Nitya Khanna
        const userPassword = await bcrypt.hash('nitya@123', 10);
        const userResult = await db.query(
            `INSERT INTO users (full_name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, full_name, email`,
            ['Nitya Khanna', 'nitya.khanna11@gmail.com', userPassword]
        );
        if (userResult.rows.length > 0) {
            console.log('User created:', userResult.rows[0]);
        } else {
            console.log('User nitya.khanna11@gmail.com already exists, skipped.');
        }

        console.log('\nDone! You can now login with:');
        console.log('  Admin  -> /admin-login  | rohin.khanna@dynat.in / rohin@123');
        console.log('  User   -> /login        | nitya.khanna11@gmail.com / nitya@123');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seedUsers();
