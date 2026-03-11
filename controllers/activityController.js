const db = require('../config/db');

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await db.query(`
      SELECT * FROM activity_logs 
      WHERE user_id = $1 
      ORDER BY timestamp DESC 
      LIMIT 50
    `, [req.user.id]);
        res.json(logs.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching activity logs' });
    }
};
