/**
 * Clear All Data Script
 * Removes all data from the database tables to allow fresh testing
 * WARNING: This will delete ALL data - use with caution!
 */

const db = require('../config/db');

async function clearAllData() {
    console.log('==========================================');
    console.log('   PsychCare Database Cleanup Script');
    console.log('==========================================\n');

    try {
        console.log('🗑️  Clearing all data from tables...\n');

        // Order matters due to foreign key constraints
        // Delete from child tables first, then parent tables

        // 1. Activity Logs
        const activityResult = await db.query('DELETE FROM activity_logs');
        console.log(`✅ Cleared activity_logs: ${activityResult.rowCount} rows deleted`);

        // 2. DSM-5 Bookmarks
        const bookmarksResult = await db.query('DELETE FROM dsm5_bookmarks');
        console.log(`✅ Cleared dsm5_bookmarks: ${bookmarksResult.rowCount} rows deleted`);

        // 3. User Settings
        const settingsResult = await db.query('DELETE FROM user_settings');
        console.log(`✅ Cleared user_settings: ${settingsResult.rowCount} rows deleted`);

        // 4. Notes
        const notesResult = await db.query('DELETE FROM notes');
        console.log(`✅ Cleared notes: ${notesResult.rowCount} rows deleted`);

        // 5. Recordings
        const recordingsResult = await db.query('DELETE FROM recordings');
        console.log(`✅ Cleared recordings: ${recordingsResult.rowCount} rows deleted`);

        // 6. Treatment Plans
        const treatmentResult = await db.query('DELETE FROM treatment_plans');
        console.log(`✅ Cleared treatment_plans: ${treatmentResult.rowCount} rows deleted`);

        // 7. Diagnoses
        const diagnosesResult = await db.query('DELETE FROM diagnoses');
        console.log(`✅ Cleared diagnoses: ${diagnosesResult.rowCount} rows deleted`);

        // 8. Medications
        const medicationsResult = await db.query('DELETE FROM medications');
        console.log(`✅ Cleared medications: ${medicationsResult.rowCount} rows deleted`);

        // 9. Medical History
        const historyResult = await db.query('DELETE FROM medical_history');
        console.log(`✅ Cleared medical_history: ${historyResult.rowCount} rows deleted`);

        // 10. Appointments
        const appointmentsResult = await db.query('DELETE FROM appointments');
        console.log(`✅ Cleared appointments: ${appointmentsResult.rowCount} rows deleted`);

        // 11. Patients
        const patientsResult = await db.query('DELETE FROM patients');
        console.log(`✅ Cleared patients: ${patientsResult.rowCount} rows deleted`);

        // 12. Users (professionals)
        const usersResult = await db.query('DELETE FROM users');
        console.log(`✅ Cleared users: ${usersResult.rowCount} rows deleted`);

        // Reset sequences (auto-increment counters) to 1
        console.log('\n🔄 Resetting ID sequences...');

        const sequences = [
            'users_id_seq',
            'patients_id_seq',
            'appointments_id_seq',
            'recordings_id_seq',
            'activity_logs_id_seq',
            'notes_id_seq',
            'note_templates_id_seq',
            'dsm5_bookmarks_id_seq',
            'medical_history_id_seq',
            'medications_id_seq',
            'diagnoses_id_seq',
            'treatment_plans_id_seq',
            'user_settings_id_seq'
        ];

        for (const seq of sequences) {
            try {
                await db.query(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
                console.log(`   ✅ Reset ${seq}`);
            } catch (err) {
                // Sequence might not exist, skip silently
            }
        }

        console.log('\n==========================================');
        console.log('   ✅ All data cleared successfully!');
        console.log('==========================================');
        console.log('\nYou can now start fresh with real data.');
        console.log('Register a new account at: http://localhost:5173/signup\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error clearing data:', error.message);
        process.exit(1);
    }
}

clearAllData();
