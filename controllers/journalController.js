const db = require('../config/db');

exports.getMyJournals = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT j.* FROM journals j
             JOIN user_journals uj ON j.id = uj.journal_id
             WHERE uj.user_id = $1
             ORDER BY j.name ASC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching journals:', err);
        res.status(500).json({ message: 'Error fetching journals' });
    }
};

exports.getAllJournals = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM journals ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all journals:', err);
        res.status(500).json({ message: 'Error fetching journals' });
    }
};
