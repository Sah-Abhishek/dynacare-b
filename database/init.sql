-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    practice_name VARCHAR(150),
    specialization VARCHAR(100),
    license_number VARCHAR(50),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    dob DATE,
    gender VARCHAR(20),
    address TEXT,
    insurance_provider VARCHAR(100),
    insurance_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    professional_id INTEGER REFERENCES users(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 60, -- minutes
    type VARCHAR(50), -- e.g., 'Initial Assessment', 'Follow-up'
    status VARCHAR(20) DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Recordings Table
CREATE TABLE IF NOT EXISTS recordings (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    professional_id INTEGER REFERENCES users(id),
    appointment_id INTEGER REFERENCES appointments(id),
    audio_url TEXT,
    transcript TEXT,
    summary TEXT,
    duration INTEGER, -- seconds
    file_size BIGINT,
    format VARCHAR(10) DEFAULT 'mp3',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'Patient', 'Recording', 'Appointment'
    target_id INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    professional_id INTEGER REFERENCES users(id),
    appointment_id INTEGER REFERENCES appointments(id),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft', -- 'Draft', 'Finalized'
    ai_insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Note Templates Table
CREATE TABLE IF NOT EXISTS note_templates (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER REFERENCES users(id), -- NULL for system templates
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DSM-5 Disorders Table
CREATE TABLE IF NOT EXISTS dsm5_disorders (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    key_symptoms JSONB,
    full_criteria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DSM-5 Bookmarks Table
CREATE TABLE IF NOT EXISTS dsm5_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    disorder_id INTEGER REFERENCES dsm5_disorders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, disorder_id)
);

-- Create Medical History Table
CREATE TABLE IF NOT EXISTS medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    type VARCHAR(50), -- 'Condition', 'Allergy', 'FamilyHistory'
    name VARCHAR(150),
    detail TEXT, -- reaction for allergy, year for condition, relation for family
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    name VARCHAR(150),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Discontinued'
    prescribed_by VARCHAR(150),
    start_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Diagnoses Table
CREATE TABLE IF NOT EXISTS diagnoses (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    dsm_code VARCHAR(20),
    disorder_name VARCHAR(150),
    diagnosed_date DATE,
    status VARCHAR(20) DEFAULT 'Current', -- 'Current', 'Previous'
    doctor_name VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Treatment Plans Table
CREATE TABLE IF NOT EXISTS treatment_plans (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    goal TEXT,
    intervention TEXT,
    progress_notes TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    recording_enabled BOOLEAN DEFAULT TRUE,
    audio_quality VARCHAR(50) DEFAULT 'Standard (128 kbps)',
    auto_transcribe BOOLEAN DEFAULT TRUE,
    transcription_lang VARCHAR(50) DEFAULT 'English',
    ai_whisper_configured BOOLEAN DEFAULT FALSE,
    dsm5_detection BOOLEAN DEFAULT TRUE,
    detection_sensitivity VARCHAR(50) DEFAULT 'Medium',
    data_retention_days INTEGER DEFAULT 90,
    require_consent BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT FALSE,
    app_reminders BOOLEAN DEFAULT FALSE,
    diagnostic_insights BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



