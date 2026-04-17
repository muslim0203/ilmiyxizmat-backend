const express     = require('express');
const pool        = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM faq ORDER BY id ASC');
        res.json(rows.map(toClient));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ error: 'Savol va javob talab qilinadi.' });
        }
        const { rows } = await pool.query(
            'INSERT INTO faq (question, answer) VALUES ($1, $2) RETURNING *',
            [question, answer]
        );
        res.status(201).json(toClient(rows[0]));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { question, answer } = req.body;
        const { rows } = await pool.query(
            'UPDATE faq SET question=$1, answer=$2 WHERE id=$3 RETURNING *',
            [question, answer, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Topilmadi.' });
        res.json(toClient(rows[0]));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM faq WHERE id = $1', [req.params.id]);
        if (!rowCount) return res.status(404).json({ error: 'Topilmadi.' });
        res.json({ message: 'O\'chirildi.' });
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

function toClient(row) {
    return {
        id:        row.id,
        question:  row.question,
        answer:    row.answer,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

module.exports = router;
