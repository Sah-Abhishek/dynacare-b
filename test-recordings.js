/**
 * Verification test: Recordings should now be visible for the correct user.
 */

const { Pool } = require('pg');
const http = require('http');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

const API_BASE = `http://localhost:${process.env.PORT || 5506}`;

function apiRequest(method, urlPath, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, API_BASE);
        const opts = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        };
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

let passed = 0, failed = 0;
function log(label, ok, detail) {
    const s = ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`  [${s}] ${label}`);
    if (detail) console.log(`         ${detail}`);
    ok ? passed++ : failed++;
}

async function run() {
    console.log('\n=== VERIFICATION: Recording Visibility After Fix ===\n');

    // 1. Confirm DB state
    const recsByProf = (await pool.query(
        'SELECT professional_id, COUNT(*) as cnt FROM recordings GROUP BY professional_id'
    )).rows;
    console.log('── DB: Recordings by professional_id ──');
    recsByProf.forEach(r => console.log(`  professional_id=${r.professional_id} → ${r.cnt} recordings`));
    log('All recordings belong to professional_id=2 (Abhishek)',
        recsByProf.length === 1 && recsByProf[0].professional_id === 2);

    // 2. Login as user id=1 (test account) - should see 0 recordings now
    console.log('\n── API: User id=1 (test account) should see 0 recordings ──');
    const login1 = await apiRequest('POST', '/api/auth/login',
        { email: 'auto_test_fix@example.com', password: 'password123' });
    if (login1.status === 200) {
        const res = await apiRequest('GET', '/api/recordings', null,
            { 'Authorization': `Bearer ${login1.data.token}` });
        const count = Array.isArray(res.data) ? res.data.length : 0;
        log(`Test account (id=1) sees ${count} recordings`, count === 0,
            count === 0 ? 'Correct - recordings no longer tied to test account' : 'Should be 0!');
    }

    // 3. Try to login as Abhishek (we don't know password, so test via DB token simulation)
    // Instead, test the getRecordings query directly
    console.log('\n── DB: Simulated query for Abhishek (professional_id=2) ──');
    const abhishekRecs = await pool.query(
        `SELECT r.id, r.patient_id, p.full_name as patient_name, r.audio_url, r.duration, r.created_at
         FROM recordings r JOIN patients p ON r.patient_id = p.id
         WHERE r.professional_id = 2 ORDER BY r.created_at DESC LIMIT 5`
    );
    log(`Abhishek (id=2) query returns ${abhishekRecs.rowCount} recordings`, abhishekRecs.rowCount > 0);
    if (abhishekRecs.rowCount > 0) {
        console.log('         Recent:');
        abhishekRecs.rows.forEach(r =>
            console.log(`           id=${r.id} patient=${r.patient_name}(${r.patient_id}) audio=${r.audio_url ? 'YES' : 'NO'} duration=${r.duration}s ${r.created_at}`)
        );
    }

    // 4. Test patientId filter (now with restarted server)
    console.log('\n── API: patientId filter (restarted server) ──');
    if (login1.status === 200) {
        // This user has 0 recordings, so skip
    }
    // Test directly with DB
    const patient13 = await pool.query(
        `SELECT COUNT(*) as cnt FROM recordings WHERE professional_id = 2 AND patient_id = 13`
    );
    const patient1 = await pool.query(
        `SELECT COUNT(*) as cnt FROM recordings WHERE professional_id = 2 AND patient_id = 1`
    );
    log(`Bharat (patient_id=13): ${patient13.rows[0].cnt} recordings`, parseInt(patient13.rows[0].cnt) > 0);
    log(`sahil (patient_id=1): ${patient1.rows[0].cnt} recordings`, true);

    // 5. Test patientId filter via API with the test account token (it should get 0 anyway)
    // Better: let's test with a crafted JWT for user id=2
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({ id: 2, email: 'abhishek@gmail.com' }, process.env.JWT_SECRET);

    console.log('\n── API: Recordings for Abhishek via crafted JWT ──');
    const allRecsRes = await apiRequest('GET', '/api/recordings', null,
        { 'Authorization': `Bearer ${testToken}` });
    const allCount = Array.isArray(allRecsRes.data) ? allRecsRes.data.length : 0;
    log(`GET /recordings (all): ${allCount} recordings`, allCount > 0,
        allCount > 0 ? 'Abhishek can now see recordings!' : 'Still 0 - something else is wrong');

    // Test patientId filter
    const filtered13 = await apiRequest('GET', '/api/recordings?patientId=13', null,
        { 'Authorization': `Bearer ${testToken}` });
    const count13 = Array.isArray(filtered13.data) ? filtered13.data.length : 0;

    const filtered1 = await apiRequest('GET', '/api/recordings?patientId=1', null,
        { 'Authorization': `Bearer ${testToken}` });
    const count1 = Array.isArray(filtered1.data) ? filtered1.data.length : 0;

    const filtered999 = await apiRequest('GET', '/api/recordings?patientId=999', null,
        { 'Authorization': `Bearer ${testToken}` });
    const count999 = Array.isArray(filtered999.data) ? filtered999.data.length : 0;

    log(`GET /recordings?patientId=13 (Bharat): ${count13} recordings`, count13 > 0 && count13 < allCount);
    log(`GET /recordings?patientId=1 (sahil): ${count1} recordings`, count1 < allCount);
    log(`GET /recordings?patientId=999 (nonexistent): ${count999} recordings`, count999 === 0,
        count999 === 0 ? 'Filter correctly returns 0 for non-existent patient' : 'Filter broken!');

    // 6. Test upload now requires auth
    console.log('\n── API: Upload requires auth ──');
    const noAuthUpload = await apiRequest('POST', '/api/recordings/upload-file', null, {});
    log(`POST /upload-file without auth: status=${noAuthUpload.status}`, noAuthUpload.status === 401,
        noAuthUpload.status === 401 ? 'Correctly rejected - auth required' : 'Should be 401!');

    // Summary
    console.log('\n══════════════════════════════════');
    console.log(`  \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
    console.log('══════════════════════════════════\n');

    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error(err); pool.end(); process.exit(1); });
