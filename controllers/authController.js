const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { full_name, email, password, practice_name, role, license_number } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
        return res.status(400).json({
            message: 'Please provide all required fields: Full Name, Email, and Password'
        });
    }

    // Trim and lowercase email for consistency
    const cleanEmail = email.trim().toLowerCase();

    try {
        console.log(`[Registration] Attempt for email: ${cleanEmail}`);

        // Check if user exists
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
        if (userResult.rows.length > 0) {
            console.log(`[Registration] Failed: User already exists (${cleanEmail})`);
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user with all fields
        console.log(`[Registration] Inserting new user: ${cleanEmail}`);
        const newUser = await db.query(
            'INSERT INTO users (full_name, email, password, practice_name, specialization, license_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, practice_name, specialization, license_number',
            [full_name, cleanEmail, hashedPassword, practice_name, role || 'Psychiatrist', license_number]
        );

        if (!newUser.rows[0]) {
            throw new Error('Database failed to return the new user record');
        }

        // Create JWT
        console.log(`[Registration] Generating token for user ID: ${newUser.rows[0].id}`);
        const token = jwt.sign(
            { id: newUser.rows[0].id, email: newUser.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`[Registration] Success: ${cleanEmail}`);
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0],
            token
        });
    } catch (err) {
        console.error('[Registration] CRITICAL ERROR:', err);
        res.status(500).json({
            message: 'Server error during registration. Please check server logs.',
            error: err.message
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                practice_name: user.practice_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userResult = await db.query(
            'SELECT id, full_name, email, practice_name, specialization, license_number, phone_number FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};
