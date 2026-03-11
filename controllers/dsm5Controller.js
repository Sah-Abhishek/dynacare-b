const db = require('../config/db');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


exports.getDisorders = async (req, res) => {
    console.log('GET /api/dsm5/disorders - Query Params:', req.query);
    const { category, search } = req.query;
    let query = 'SELECT * FROM dsm5_disorders WHERE 1=1';
    const params = [];

    if (category && category !== 'All Disorders') {
        params.push(category);
        query += ` AND category = $${params.length}`;
    }

    if (search) {
        params.push(`%${search}%`);
        query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length})`;
    }

    query += ' ORDER BY name ASC';

    try {
        const disorders = await db.query(query, params);
        console.log(`Found ${disorders.rows.length} disorders`);
        res.json(disorders.rows);
    } catch (err) {
        console.error('Database Error in getDisorders:', err);
        res.status(500).json({ message: 'Error fetching disorders' });
    }
};

exports.getDisorderByCode = async (req, res) => {
    try {
        const disorder = await db.query('SELECT * FROM dsm5_disorders WHERE code = $1', [req.params.code]);
        if (disorder.rows.length === 0) {
            return res.status(404).json({ message: 'Disorder not found' });
        }
        res.json(disorder.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching disorder details' });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const bookmarks = await db.query(`
      SELECT d.* 
      FROM dsm5_bookmarks b 
      JOIN dsm5_disorders d ON b.disorder_id = d.id 
      WHERE b.user_id = $1
    `, [req.user.id]);
        res.json(bookmarks.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching bookmarks' });
    }
};

exports.toggleBookmark = async (req, res) => {
    const { disorder_id } = req.body;
    try {
        // Check if already bookmarked
        const existing = await db.query(
            'SELECT * FROM dsm5_bookmarks WHERE user_id = $1 AND disorder_id = $2',
            [req.user.id, disorder_id]
        );

        if (existing.rows.length > 0) {
            // Remove bookmark
            await db.query(
                'DELETE FROM dsm5_bookmarks WHERE user_id = $1 AND disorder_id = $2',
                [req.user.id, disorder_id]
            );
            res.json({ message: 'Bookmark removed', bookmarked: false });
        } else {
            // Add bookmark
            await db.query(
                'INSERT INTO dsm5_bookmarks (user_id, disorder_id) VALUES ($1, $2)',
                [req.user.id, disorder_id]
            );
            res.json({ message: 'Bookmark added', bookmarked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error toggling bookmark' });
    }
};

exports.searchAI = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query is required' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a professional clinical assistant provided with the DSM-5-TR manual. 
                    Your task is to provide accurate, comprehensive diagnostic criteria for the requested disorder.
                    Format your response as a JSON object with the following structure:
                    {
                        "name": "Disorder Name",
                        "code": "ICD-10 Code",
                        "category": "DSM-5 Category",
                        "key_symptoms": ["symptom 1", "symptom 2", ...],
                        "full_criteria": "The full diagnostic criteria text",
                        "clinical_notes": "Brief clinical insights or differential diagnosis tips"
                    }`
                },
                {
                    role: "user",
                    content: `Provide DSM-5 diagnostic criteria for: ${query}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json(result);
    } catch (err) {
        console.error('OpenAI Error:', err);
        res.status(500).json({ message: 'AI Search failed. Please ensure the API key is configured.' });
    }
};
