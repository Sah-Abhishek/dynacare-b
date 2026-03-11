require('dotenv').config({ path: '../.env' }); // Adjust path to .env
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runSchema() {
    try {
        await client.connect();
        console.log('Connected to database to run schema...');

        const sqlPath = path.join(__dirname, '../database/init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing init.sql...');
        await client.query(sql);
        console.log('Schema created successfully!');

        await client.end();
    } catch (err) {
        console.error('Error creating schema:', err);
    }
}

runSchema();
