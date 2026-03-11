# PsychCare Backend API Documentation

This document outlines the required API endpoints for the PsychCare Mental Health & Wellness platform based on the current frontend implementation.

## 1. Authentication & User Management
*   `POST /api/auth/login`: Authenticate psychiatrist/professional.
*   `POST /api/auth/register`: Register new professional account.
*   `GET /api/user/profile`: Fetch current user's profile and practice info.
*   `PUT /api/user/profile`: Update professional/practice details.

## 2. Patient Management
*   `GET /api/patients`: List all patients with search/filter.
*   `POST /api/patients`: Create a new patient record.
*   `GET /api/patients/:id`: Detailed patient profile (medical history, contact, insurance).
*   `PUT /api/patients/:id`: Update patient information.
*   `GET /api/patients/:id/progress`: Fetch treatment progress data and metrics.

## 3. Appointment Management
*   `GET /api/appointments`: Fetch appointments (with date range support).
*   `POST /api/appointments`: Schedule a new appointment.
*   `GET /api/appointments/:id`: Fetch specific appointment details.
*   `PUT /api/appointments/:id`: Update/Reschedule appointment.
*   `DELETE /api/appointments/:id`: Cancel appointment.

## 4. Session & Recording Management
*   `GET /api/recordings`: List recent session recordings.
*   `POST /api/recordings/upload`: Upload audio recording for a session.
*   `GET /api/recordings/:id`: Fetch specific recording metadata and URL.
*   `POST /api/sessions/start`: Initialize a new live session for a patient.
*   `POST /api/sessions/:id/stop`: End current session and trigger post-processing.

## 5. Clinical Notes & Documentation
*   `GET /api/notes`: Fetch all clinical notes for a patient.
*   `POST /api/notes`: Create new session notes.
*   `GET /api/notes/:id`: Fetch specific note details.
*   `PUT /api/notes/:id`: Update clinical note (Draft/Finalize).
*   `GET /api/notes/templates`: Fetch clinical note templates (Intake, Follow-up, etc.).

## 6. AI & Clinical Intelligence
*   `POST /api/ai/transcribe`: Process audio recording into text (Whisper integration).
*   `POST /api/ai/analyze-session`: Generate clinical summary and insights from transcript.
*   `GET /api/ai/diagnostic-suggestions`: Fetch AI-powered DSM-5 suggestions for active session.
*   `POST /api/ai/note-assistant`: AI-powered editing (grammar, clinical detail enhancement).

## 7. DSM-5 Reference
*   `GET /api/dsm5/disorders`: Search and filter DSM-5 disorders.
*   `GET /api/dsm5/disorders/:code`: Fetch full criteria and symptoms for a specific code.
*   `GET /api/dsm5/bookmarks`: List user's bookmarked disorders.
*   `POST /api/dsm5/bookmarks`: Toggle bookmark for a disorder.

## 8. Dashboard & Analytics
*   `GET /api/dashboard/stats`: Fetch high-level stats (Total patients, Sessions this month, Recovery rate).
*   `GET /api/dashboard/activity`: Fetch recent activity feed and patient progress trends.

## 9. Settings & Preferences
*   `GET /api/settings`: Fetch all user preferences (Recording, AI, Privacy, Notifications).
*   `PATCH /api/settings`: Update specific settings sections.
*   `POST /api/settings/export`: Export all configuration data.

---
**Tech Stack Recommendation:**
*   **Backend**: Node.js with Express or Fastify.
*   **Database**: PostgreSQL (for patient/session data) or MongoDB.
*   **Real-time**: WebSockets (Socket.io) for live recording/AI insights.
*   **AI Integration**: OpenAI (Whisper, GPT-4o) for transcription and analysis.
