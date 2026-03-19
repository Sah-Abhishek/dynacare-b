const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/recordings', require('./routes/recordingRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/dsm5', require('./routes/dsm5Routes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/clinical', require('./routes/clinicalRoutes'));
app.use('/api/images', require('./routes/imageRoutes'));
app.use('/api/journals', require('./routes/journalRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DynaCare API' });
});

// 404 Handler
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route ${req.method} ${req.url} not found on this server.` });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error('SERVER STARTUP ERROR:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port or kill the existing process.`);
    }
});
