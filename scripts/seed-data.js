require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const patients = [
    {
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        dob: '1985-06-15',
        gender: 'Male',
        address: '123 Main St, Springfield, IL',
        insurance_provider: 'Blue Cross Blue Shield',
        insurance_id: 'BCBS123456789',
        status: 'Active'
    },
    {
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1 (555) 987-6543',
        dob: '1990-11-23',
        gender: 'Female',
        address: '456 Oak Ave, Metropolis, NY',
        insurance_provider: 'Aetna',
        insurance_id: 'AET987654321',
        status: 'Active'
    }
];

const disorders = [
    {
        code: 'F32.9',
        name: 'Major Depressive Disorder, Unspecified',
        category: 'Mood Disorders',
        key_symptoms: JSON.stringify(['Depressed mood', 'Loss of interest', 'Fatigue', 'Difficulty concentrating']),
        full_criteria: 'Five (or more) of the following symptoms have been present during the same 2-week period and represent a change from previous functioning...'
    },
    {
        code: 'F41.1',
        name: 'Generalized Anxiety Disorder',
        category: 'Anxiety Disorders',
        key_symptoms: JSON.stringify(['Excessive anxiety', 'Restlessness', 'Fatigue', 'Irritability']),
        full_criteria: 'Excessive anxiety and worry (apprehensive expectation), occurring more days than not for at least 6 months, about a number of events or activities...'
    },
    {
        code: 'F20.9',
        name: 'Schizophrenia',
        category: 'Psychotic Disorders',
        key_symptoms: JSON.stringify(['Delusions', 'Hallucinations', 'Disorganized speech', 'Grossly disorganized behavior']),
        full_criteria: 'Two (or more) of the following, each present for a significant portion of time during a 1-month period...'
    }
];

async function seedData() {
    try {
        await client.connect();
        console.log('Connected to database for seeding...');

        // Seed Patients
        for (const patient of patients) {
            const check = await client.query('SELECT * FROM patients WHERE email = $1', [patient.email]);
            if (check.rows.length === 0) {
                await client.query(
                    'INSERT INTO patients (full_name, email, phone, dob, gender, address, insurance_provider, insurance_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                    [patient.full_name, patient.email, patient.phone, patient.dob, patient.gender, patient.address, patient.insurance_provider, patient.insurance_id, patient.status]
                );
                console.log(`Added patient: ${patient.full_name}`);
            } else {
                console.log(`Patient ${patient.full_name} already exists.`);
            }
        }

        // Seed Disorders
        for (const disorder of disorders) {
            const check = await client.query('SELECT * FROM dsm5_disorders WHERE code = $1', [disorder.code]);
            if (check.rows.length === 0) {
                await client.query(
                    'INSERT INTO dsm5_disorders (code, name, category, key_symptoms, full_criteria) VALUES ($1, $2, $3, $4, $5)',
                    [disorder.code, disorder.name, disorder.category, disorder.key_symptoms, disorder.full_criteria]
                );
                console.log(`Added disorder: ${disorder.name}`);
            } else {
                console.log(`Disorder ${disorder.name} already exists.`);
            }
        }

        console.log('Seeding complete!');
        await client.end();
    } catch (err) {
        console.error('Error seeding data:', err);
    }
}

seedData();
