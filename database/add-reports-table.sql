-- Migration: add reports table for saved PDF clinical reports stored on S3
-- Run once on existing databases:
--   psql "$DATABASE_URL" -f database/add-reports-table.sql

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    professional_id INTEGER REFERENCES users(id),
    session_id INTEGER REFERENCES sessions(id),
    title VARCHAR(255),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    file_size BIGINT,
    summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_patient ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_professional ON reports(professional_id);
