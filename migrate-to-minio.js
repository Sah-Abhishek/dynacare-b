/**
 * Migration script: move all files from Cloudinary + old Utho S3 → new MinIO S3.
 *
 * What it does:
 *   1. recordings.audio_url  — downloads from Cloudinary, uploads to MinIO, updates DB
 *   2. note_images.image_url — downloads from Cloudinary, uploads to MinIO, updates DB
 *   3. reports.file_url      — downloads from old Utho S3, uploads to MinIO, updates DB
 *
 * Usage:
 *   node migrate-to-minio.js
 *
 * The script is idempotent — rows already pointing at the new MinIO endpoint are skipped.
 */

require('dotenv').config();
const { Pool } = require('pg');
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} = require('@aws-sdk/client-s3');

// ─── Old storage clients ────────────────────────────────────────────────────

// Old Utho S3 (for reports that are already on the old bucket)
const OLD_S3_ENDPOINT = 'https://mybucketrjhip8nnndkwvztx.innoida.utho.io';
const OLD_S3_ACCESS_KEY = 'HSWFbjqcm9otTLwl6s5uRVzBkX0i7ZnI3fOY';
const OLD_S3_SECRET_KEY = 'r0mXH9Sqiac6kzhKuEdTWNxO825Jw7bCYtZ3';
const OLD_S3_BUCKET = 'indiamart';

const oldS3 = new S3Client({
    region: 'auto',
    endpoint: OLD_S3_ENDPOINT,
    credentials: {
        accessKeyId: OLD_S3_ACCESS_KEY,
        secretAccessKey: OLD_S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

// ─── New MinIO S3 client ────────────────────────────────────────────────────

const NEW_S3_ENDPOINT = process.env.S3_ENDPOINT_URL || 'http://91.203.132.109:9005';
const NEW_S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'admin';
const NEW_S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'MinioAdmin@1';
const NEW_S3_BUCKET = process.env.S3_BUCKET_NAME || 'data-dynacare';
const NEW_S3_REGION = process.env.S3_REGION || 'us-east-1';

const newS3 = new S3Client({
    region: NEW_S3_REGION,
    endpoint: NEW_S3_ENDPOINT,
    credentials: {
        accessKeyId: NEW_S3_ACCESS_KEY,
        secretAccessKey: NEW_S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

// ─── Database ───────────────────────────────────────────────────────────────

function resolveSsl(connectionString) {
    if (!connectionString) return false;
    let sslmode;
    try { sslmode = new URL(connectionString).searchParams.get('sslmode'); } catch { sslmode = null; }
    switch (sslmode) {
        case 'require': case 'prefer': return { rejectUnauthorized: false };
        case 'verify-ca': case 'verify-full': return { rejectUnauthorized: true };
        default: return false;
    }
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: resolveSsl(process.env.DATABASE_URL),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const fetch = require('node-fetch');

async function downloadUrl(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
}

async function downloadFromOldS3(key) {
    const command = new GetObjectCommand({ Bucket: OLD_S3_BUCKET, Key: key });
    const response = await oldS3.send(command);
    // Collect stream into buffer
    const chunks = [];
    for await (const chunk of response.Body) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

async function uploadToNewS3(key, buffer, contentType) {
    const command = new PutObjectCommand({
        Bucket: NEW_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
    });
    await newS3.send(command);
    return `${NEW_S3_ENDPOINT}/${NEW_S3_BUCKET}/${key}`;
}

function isAlreadyOnMinio(url) {
    return url && url.includes('91.203.132.109:9005');
}

// ─── Migrate recordings (Cloudinary → MinIO) ───────────────────────────────

async function migrateRecordings() {
    console.log('\n=== Migrating recordings ===');
    const { rows } = await pool.query('SELECT id, audio_url, format FROM recordings WHERE audio_url IS NOT NULL');
    console.log(`Found ${rows.length} recordings with audio URLs`);

    let migrated = 0, skipped = 0, failed = 0;

    for (const row of rows) {
        if (isAlreadyOnMinio(row.audio_url)) {
            skipped++;
            continue;
        }

        try {
            const buffer = await downloadUrl(row.audio_url);
            const ext = row.format || 'mp3';
            const key = `dynacare/audio/recording_${row.id}_${Date.now()}.${ext}`;
            const contentType = `audio/${ext === 'wav' ? 'wav' : 'mpeg'}`;
            const newUrl = await uploadToNewS3(key, buffer, contentType);

            await pool.query('UPDATE recordings SET audio_url = $1 WHERE id = $2', [newUrl, row.id]);
            migrated++;
            console.log(`  [OK] recording #${row.id} → ${key}`);
        } catch (err) {
            failed++;
            console.error(`  [FAIL] recording #${row.id}: ${err.message}`);
        }
    }

    console.log(`Recordings done — migrated: ${migrated}, skipped: ${skipped}, failed: ${failed}`);
}

// ─── Migrate note_images (Cloudinary → MinIO) ──────────────────────────────

async function migrateImages() {
    console.log('\n=== Migrating note images ===');
    const { rows } = await pool.query('SELECT id, image_url, original_name, mime_type FROM note_images WHERE image_url IS NOT NULL');
    console.log(`Found ${rows.length} images`);

    let migrated = 0, skipped = 0, failed = 0;

    for (const row of rows) {
        if (isAlreadyOnMinio(row.image_url)) {
            skipped++;
            continue;
        }

        try {
            const buffer = await downloadUrl(row.image_url);
            const ext = (row.original_name || 'image.jpg').split('.').pop() || 'jpg';
            const key = `dynacare/images/image_${row.id}_${Date.now()}.${ext}`;
            const contentType = row.mime_type || `image/${ext}`;
            const newUrl = await uploadToNewS3(key, buffer, contentType);

            await pool.query(
                'UPDATE note_images SET image_url = $1, cloudinary_id = NULL WHERE id = $2',
                [newUrl, row.id]
            );
            migrated++;
            console.log(`  [OK] image #${row.id} → ${key}`);
        } catch (err) {
            failed++;
            console.error(`  [FAIL] image #${row.id}: ${err.message}`);
        }
    }

    console.log(`Images done — migrated: ${migrated}, skipped: ${skipped}, failed: ${failed}`);
}

// ─── Migrate reports (old Utho S3 → MinIO) ─────────────────────────────────

async function migrateReports() {
    console.log('\n=== Migrating reports ===');
    const { rows } = await pool.query('SELECT id, file_url, s3_key, file_name FROM reports WHERE s3_key IS NOT NULL');
    console.log(`Found ${rows.length} reports`);

    let migrated = 0, skipped = 0, failed = 0;

    for (const row of rows) {
        if (isAlreadyOnMinio(row.file_url)) {
            skipped++;
            continue;
        }

        try {
            const buffer = await downloadFromOldS3(row.s3_key);
            // Keep the same key structure
            const key = row.s3_key;
            const newUrl = await uploadToNewS3(key, buffer, 'application/pdf');

            await pool.query(
                'UPDATE reports SET file_url = $1 WHERE id = $2',
                [newUrl, row.id]
            );
            migrated++;
            console.log(`  [OK] report #${row.id} → ${key}`);
        } catch (err) {
            failed++;
            console.error(`  [FAIL] report #${row.id}: ${err.message}`);
        }
    }

    console.log(`Reports done — migrated: ${migrated}, skipped: ${skipped}, failed: ${failed}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    console.log('Starting migration to MinIO S3...');
    console.log(`  MinIO endpoint: ${NEW_S3_ENDPOINT}`);
    console.log(`  Bucket: ${NEW_S3_BUCKET}`);

    try {
        await migrateRecordings();
        await migrateImages();
        await migrateReports();
        console.log('\n=== Migration complete ===');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

main();
