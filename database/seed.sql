-- Sample data for PsychCare application

-- Insert sample users (professionals)
INSERT INTO users (full_name, email, password, specialization, practice_name, license_number, phone_number) VALUES
('Dr. Demo Account', 'demo@psychcare.com', '$2b$10$LhHYdI1zNxypL0Qq8SSTLOtaQ5UQTKSQRLMcBNBBQH0kEr96.zvi36', 'Clinical Psychology', 'PsychCare Clinic', 'PSY99999', '555-9999'),
('Dr. Sarah Johnson', 'sarah.johnson@psychcare.com', '$2b$10$LhHYdI1zNxypL0Qq8SSTLOtaQ5UQTKSQRLMcBNBBQH0kEr96.zvi36', 'Clinical Psychology', 'PsychCare Clinic', 'PSY12345', '555-1001'),
('Dr. Michael Chen', 'michael.chen@psychcare.com', '$2b$10$LhHYdI1zNxypL0Qq8SSTLOtaQ5UQTKSQRLMcBNBBQH0kEr96.zvi36', 'Psychiatry', 'PsychCare Clinic', 'PSY12346', '555-1002'),
('Dr. Emily Rodriguez', 'emily.rodriguez@psychcare.com', '$2b$10$LhHYdI1zNxypL0Qq8SSTLOtaQ5UQTKSQRLMcBNBBQH0kEr96.zvi36', 'Counseling Psychology', 'PsychCare Clinic', 'PSY12347', '555-1003')
ON CONFLICT (email) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (full_name, email, phone, dob, gender, address, insurance_provider, insurance_id, status) VALUES
('John Smith', 'john.smith@email.com', '555-0101', '1985-03-15', 'Male', '123 Main St, City, State 12345', 'BlueCross', 'BC123456', 'Active'),
('Jane Doe', 'jane.doe@email.com', '555-0102', '1990-07-22', 'Female', '456 Oak Ave, City, State 12345', 'Aetna', 'AE789012', 'Active'),
('Robert Wilson', 'robert.wilson@email.com', '555-0103', '1978-11-30', 'Male', '789 Pine Rd, City, State 12345', 'UnitedHealth', 'UH345678', 'Active'),
('Maria Garcia', 'maria.garcia@email.com', '555-0104', '1995-05-18', 'Female', '321 Elm St, City, State 12345', 'Cigna', 'CG901234', 'Active'),
('David Lee', 'david.lee@email.com', '555-0105', '1982-09-08', 'Male', '654 Maple Dr, City, State 12345', 'BlueCross', 'BC567890', 'Active'),
('Lisa Anderson', 'lisa.anderson@email.com', '555-0106', '1988-12-25', 'Female', '987 Cedar Ln, City, State 12345', 'Aetna', 'AE234567', 'Active'),
('James Taylor', 'james.taylor@email.com', '555-0107', '1975-04-12', 'Male', '159 Birch Ct, City, State 12345', 'UnitedHealth', 'UH678901', 'Active'),
('Patricia Martinez', 'patricia.martinez@email.com', '555-0108', '1992-08-20', 'Female', '753 Spruce Way, City, State 12345', 'Cigna', 'CG345678', 'Active'),
('Test Patient', 'test.patient@email.com', '555-0109', '1990-01-01', 'Other', '100 Test St, City, State 12345', 'TestInsurance', 'TEST123', 'Active'),
('Anna Williams', 'anna.williams@email.com', '555-0110', '1987-06-14', 'Female', '852 Willow Blvd, City, State 12345', 'BlueCross', 'BC234567', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample appointments (using patient IDs and professional ID 1)
INSERT INTO appointments (patient_id, professional_id, appointment_date, duration, type, status, notes) VALUES
((SELECT id FROM patients WHERE email = 'john.smith@email.com'), 1, (CURRENT_TIMESTAMP + INTERVAL '1 day')::timestamp + TIME '09:00:00', 60, 'Initial Consultation', 'Scheduled', 'New patient intake'),
((SELECT id FROM patients WHERE email = 'jane.doe@email.com'), 1, (CURRENT_TIMESTAMP + INTERVAL '1 day')::timestamp + TIME '10:30:00', 45, 'Follow-up', 'Scheduled', 'Progress check-in'),
((SELECT id FROM patients WHERE email = 'robert.wilson@email.com'), 1, (CURRENT_TIMESTAMP + INTERVAL '2 days')::timestamp + TIME '14:00:00', 60, 'Therapy Session', 'Scheduled', 'CBT session'),
((SELECT id FROM patients WHERE email = 'maria.garcia@email.com'), 1, (CURRENT_TIMESTAMP + INTERVAL '3 days')::timestamp + TIME '11:00:00', 45, 'Therapy Session', 'Scheduled', NULL),
((SELECT id FROM patients WHERE email = 'test.patient@email.com'), 1, CURRENT_TIMESTAMP::timestamp + TIME '15:00:00', 60, 'Therapy Session', 'Scheduled', 'Test appointment for demo'),
((SELECT id FROM patients WHERE email = 'david.lee@email.com'), 1, (CURRENT_TIMESTAMP - INTERVAL '1 day')::timestamp + TIME '10:00:00', 60, 'Initial Consultation', 'Completed', 'Completed successfully'),
((SELECT id FROM patients WHERE email = 'lisa.anderson@email.com'), 1, (CURRENT_TIMESTAMP - INTERVAL '2 days')::timestamp + TIME '13:00:00', 45, 'Follow-up', 'Completed', NULL),
((SELECT id FROM patients WHERE email = 'james.taylor@email.com'), 1, (CURRENT_TIMESTAMP - INTERVAL '3 days')::timestamp + TIME '09:30:00', 60, 'Therapy Session', 'Completed', NULL)
ON CONFLICT DO NOTHING;

-- Insert some sample recordings (for completed appointments)
INSERT INTO recordings (patient_id, professional_id, appointment_id, audio_url, transcript, summary, duration, file_size, format) VALUES
(
    (SELECT id FROM patients WHERE email = 'david.lee@email.com'),
    1,
    (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE email = 'david.lee@email.com') AND status = 'Completed' LIMIT 1),
    'https://storage.example.com/recording_001.wav',
    'Patient discussed feelings of anxiety related to work stress. Reports difficulty sleeping and racing thoughts. Engaged well in session and receptive to CBT techniques.',
    'Initial consultation focused on work-related anxiety and sleep difficulties. Patient is motivated for treatment.',
    3600,
    52428800,
    'wav'
),
(
    (SELECT id FROM patients WHERE email = 'lisa.anderson@email.com'),
    1,
    (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE email = 'lisa.anderson@email.com') AND status = 'Completed' LIMIT 1),
    'https://storage.example.com/recording_002.wav',
    'Follow-up session. Patient reports improvement in mood and sleep patterns. Continuing with previously discussed coping strategies.',
    'Progress noted. Patient responding well to treatment interventions.',
    2700,
    41943040,
    'wav'
)
ON CONFLICT DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES
(1, 'Created new patient record', 'Patient', (SELECT id FROM patients WHERE email = 'john.smith@email.com')),
(1, 'Scheduled appointment', 'Appointment', 1),
(1, 'Uploaded new session recording', 'Recording', 1),
(1, 'Completed appointment', 'Appointment', (SELECT id FROM appointments WHERE status = 'Completed' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample notes
INSERT INTO notes (patient_id, professional_id, appointment_id, content, status) VALUES
(
    (SELECT id FROM patients WHERE email = 'david.lee@email.com'),
    1,
    (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE email = 'david.lee@email.com') AND status = 'Completed' LIMIT 1),
    'Initial Assessment:\n- Chief Complaint: Work-related anxiety, sleep disturbances\n- Mental Status: Alert, oriented, cooperative\n- Mood: Anxious\n- Affect: Congruent\n- Thought Process: Goal-directed with some racing thoughts\n- Plan: Begin CBT, sleep hygiene education, follow-up in 1 week',
    'Finalized'
),
(
    (SELECT id FROM patients WHERE email = 'lisa.anderson@email.com'),
    1,
    (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE email = 'lisa.anderson@email.com') AND status = 'Completed' LIMIT 1),
    'Follow-up Session:\n- Patient reports 50% improvement in anxiety symptoms\n- Sleep has improved from 4-5 hours to 6-7 hours per night\n- Practicing relaxation techniques regularly\n- Plan: Continue current approach, monitor progress',
    'Finalized'
)
ON CONFLICT DO NOTHING;

-- Insert journals
INSERT INTO journals (name, target_audience, url) VALUES
('Harrison Journal', 'Physicians', 'https://accessmedicine.mhmedical.com/book.aspx?bookid=3541'),
('DSM-5 Journal', 'Psychiatrists', 'https://ia800707.us.archive.org/15/items/info_munsha_DSM5/DSM-5.pdf'),
('Oxford Handbook of Medicine', 'Physicians', 'https://cloud.uobasrah.edu.iq/uploads/2023/02/09/8205Oxford%20Handbook%20of%20Clinical%20Medicine%2010th%202017%20Edition_SamanSarKo%20-%20Copy.pdf'),
('ICD - 10', 'Psychologist', 'https://drive.google.com/file/d/1stKA9vgXTu5l8KoBpxhNLHyTbef1bkQM/view?usp=drivesdk'),
('ICD - 11', 'Psychologist', 'https://drive.google.com/file/d/1NR2GBrzYbi1rUFC6ALlkAo_OUL3XDdaf/view?usp=drivesdk')
ON CONFLICT DO NOTHING;

-- Hardcode journal access: Demo Account (user 1) gets DSM-5, Dr. Sarah Johnson (user 2) gets Harrison
INSERT INTO user_journals (user_id, journal_id) VALUES
(1, (SELECT id FROM journals WHERE name = 'DSM-5 Journal')),
(2, (SELECT id FROM journals WHERE name = 'Harrison Journal'))
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 'Data insertion complete!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT COUNT(*) as total_recordings FROM recordings;
SELECT COUNT(*) as total_notes FROM notes;
