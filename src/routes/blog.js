const express     = require('express');
const pool        = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/blog
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM blog_posts ORDER BY date DESC, id DESC'
        );
        res.json(rows.map(toClient));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// GET /api/blog/:slug
router.get('/:slug', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM blog_posts WHERE slug = $1',
            [req.params.slug]
        );
        if (!rows.length) return res.status(404).json({ error: 'Topilmadi.' });
        res.json(toClient(rows[0]));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// POST /api/blog
router.post('/', requireAuth, async (req, res) => {
    try {
        const d = req.body;
        const { rows } = await pool.query(`
            INSERT INTO blog_posts (title, slug, excerpt, content, category, read_time, date)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
            [d.title, d.slug, d.excerpt, d.content, d.category, d.readTime, d.date || new Date()]
        );
        res.status(201).json(toClient(rows[0]));
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Bu slug allaqachon mavjud.' });
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// PUT /api/blog/:id
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const d = req.body;
        const { rows } = await pool.query(`
            UPDATE blog_posts SET
                title=$1, slug=$2, excerpt=$3, content=$4,
                category=$5, read_time=$6, date=$7
            WHERE id=$8
            RETURNING *`,
            [d.title, d.slug, d.excerpt, d.content, d.category, d.readTime, d.date, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Topilmadi.' });
        res.json(toClient(rows[0]));
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Bu slug allaqachon mavjud.' });
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// DELETE /api/blog/:id
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
        if (!rowCount) return res.status(404).json({ error: 'Topilmadi.' });
        res.json({ message: 'O\'chirildi.' });
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

function toClient(row) {
    return {
        id:        row.id,
        title:     row.title,
        slug:      row.slug,
        excerpt:   row.excerpt,
        content:   row.content,
        category:  row.category,
        readTime:  row.read_time,
        date:      row.date ? row.date.toISOString().split('T')[0] : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

module.exports = router;
