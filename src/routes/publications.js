const express     = require('express');
const pool        = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM publications ORDER BY id ASC');
        res.json(rows.map(toClient));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM publications WHERE slug = $1', [req.params.slug]
        );
        if (!rows.length) return res.status(404).json({ error: 'Topilmadi.' });
        res.json(toClient(rows[0]));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const d = req.body;
        const { rows } = await pool.query(`
            INSERT INTO publications
                (title, slug, description, icon, price, timeline, benefits, requirements)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`,
            [d.title, d.slug, d.description, d.icon, d.price, d.timeline,
             JSON.stringify(d.benefits || []),
             JSON.stringify(d.requirements || [])]
        );
        res.status(201).json(toClient(rows[0]));
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Bu slug allaqachon mavjud.' });
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    try {
        const d = req.body;
        const { rows } = await pool.query(`
            UPDATE publications SET
                title=$1, slug=$2, description=$3, icon=$4,
                price=$5, timeline=$6, benefits=$7, requirements=$8
            WHERE id=$9
            RETURNING *`,
            [d.title, d.slug, d.description, d.icon, d.price, d.timeline,
             JSON.stringify(d.benefits || []),
             JSON.stringify(d.requirements || []),
             req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Topilmadi.' });
        res.json(toClient(rows[0]));
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Bu slug allaqachon mavjud.' });
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM publications WHERE id = $1', [req.params.id]);
        if (!rowCount) return res.status(404).json({ error: 'Topilmadi.' });
        res.json({ message: 'O\'chirildi.' });
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

function toClient(row) {
    return {
        id:           row.id,
        title:        row.title,
        slug:         row.slug,
        description:  row.description,
        icon:         row.icon,
        price:        row.price,
        timeline:     row.timeline,
        benefits:     row.benefits || [],
        requirements: row.requirements || [],
        createdAt:    row.created_at,
        updatedAt:    row.updated_at,
    };
}

module.exports = router;
