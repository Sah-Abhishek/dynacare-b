require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seedDemo() {
    try {
        await client.connect();
        console.log('Connected to database...');

        // Create demo user
        const demoEmail = 'demo@psychcare.com';
        const demoPassword = 'demo123';
        const hashedPassword = await bcrypt.hash(demoPassword, 10);

        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [demoEmail]);
        if (userCheck.rows.length === 0) {
            await client.query(
                'INSERT INTO users (full_name, email, password, practice_name) VALUES ($1, $2, $3, $4)',
                ['Dr. Demo User', demoEmail, hashedPassword, 'PsychCare Demo Practice']
            );
            console.log('✅ Created demo user:');
            console.log('   Email: demo@psychcare.com');
            console.log('   Password: demo123');
        } else {
            console.log('Demo user already exists.');
        }

        // Create demo patients
        const patients = [
            {
                full_name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                dob: '1985-06-15',
                gender: 'Male',
                address: '123 Main St, Springfield, IL 62701',
                insurance_provider: 'Blue Cross Blue Shield',
                insurance_id: 'BCBS-123456789',
                status: 'Active'
            },
            {
                full_name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+1 (555) 987-6543',
                dob: '1990-11-23',
                gender: 'Female',
                address: '456 Oak Avenue, Chicago, IL 60601',
                insurance_provider: 'Aetna',
                insurance_id: 'AET-987654321',
                status: 'Active'
            },
            {
                full_name: 'Michael Johnson',
                email: 'michael.j@example.com',
                phone: '+1 (555) 456-7890',
                dob: '1978-03-10',
                gender: 'Male',
                address: '789 Pine Road, Naperville, IL 60540',
                insurance_provider: 'UnitedHealthcare',
                insurance_id: 'UHC-456789012',
                status: 'Active'
            }
        ];

        for (const patient of patients) {
            const check = await client.query('SELECT * FROM patients WHERE email = $1', [patient.email]);
            if (check.rows.length === 0) {
                await client.query(
                    'INSERT INTO patients (full_name, email, phone, dob, gender, address, insurance_provider, insurance_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                    [patient.full_name, patient.email, patient.phone, patient.dob, patient.gender, patient.address, patient.insurance_provider, patient.insurance_id, patient.status]
                );
                console.log(`✅ Added patient: ${patient.full_name}`);
            } else {
                console.log(`Patient ${patient.full_name} already exists.`);
            }
        }

        // Create demo DSM-5 disorders
        const disorders = [
            {
                code: 'F32.9',
                name: 'Major Depressive Disorder, Unspecified',
                category: 'Mood Disorders',
                key_symptoms: JSON.stringify(['Depressed mood most of the day', 'Loss of interest or pleasure', 'Significant weight change', 'Insomnia or hypersomnia', 'Fatigue or loss of energy']),
                full_criteria: 'Five or more symptoms present during same 2-week period representing a change from previous functioning.'
            },
            {
                code: 'F41.1',
                name: 'Generalized Anxiety Disorder',
                category: 'Anxiety Disorders',
                key_symptoms: JSON.stringify(['Excessive anxiety and worry', 'Difficulty controlling worry', 'Restlessness', 'Being easily fatigued', 'Difficulty concentrating']),
                full_criteria: 'Excessive anxiety and worry occurring more days than not for at least 6 months.'
            },
            {
                code: 'F43.10',
                name: 'Post-Traumatic Stress Disorder',
                category: 'Trauma & Stress',
                key_symptoms: JSON.stringify(['Intrusive memories', 'Avoidance behaviors', 'Negative alterations in mood', 'Hypervigilance', 'Exaggerated startle response']),
                full_criteria: 'Exposure to actual or threatened death, serious injury, or sexual violence.'
            }
        ];

        for (const disorder of disorders) {
            const check = await client.query('SELECT * FROM dsm5_disorders WHERE code = $1', [disorder.code]);
            if (check.rows.length === 0) {
                await client.query(
                    'INSERT INTO dsm5_disorders (code, name, category, key_symptoms, full_criteria) VALUES ($1, $2, $3, $4, $5)',
                    [disorder.code, disorder.name, disorder.category, disorder.key_symptoms, disorder.full_criteria]
                );
                console.log(`✅ Added disorder: ${disorder.name}`);
            } else {
                console.log(`Disorder ${disorder.name} already exists.`);
            }
        }

        console.log('\n🎉 Demo data seeding complete!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email: demo@psychcare.com');
        console.log('   Password: demo123');

        await client.end();
    } catch (err) {
        console.error('Error seeding demo data:', err);
        await client.end();
    }
}

seedDemo();
