const express     = require('express');
const pool        = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM scientific_works ORDER BY id ASC');
        res.json(rows.map(toClient));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM scientific_works WHERE slug = $1', [req.params.slug]
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
            INSERT INTO scientific_works
                (title, slug, description, icon, requirements, duration, related_service, meta_title, meta_desc)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`,
            [d.title, d.slug, d.description, d.icon,
             JSON.stringify(d.requirements || []),
             d.duration, d.relatedService, d.metaTitle, d.metaDescription]
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
            UPDATE scientific_works SET
                title=$1, slug=$2, description=$3, icon=$4,
                requirements=$5, duration=$6, related_service=$7,
                meta_title=$8, meta_desc=$9
            WHERE id=$10
            RETURNING *`,
            [d.title, d.slug, d.description, d.icon,
             JSON.stringify(d.requirements || []),
             d.duration, d.relatedService, d.metaTitle, d.metaDescription,
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
        const { rowCount } = await pool.query('DELETE FROM scientific_works WHERE id = $1', [req.params.id]);
        if (!rowCount) return res.status(404).json({ error: 'Topilmadi.' });
        res.json({ message: 'O\'chirildi.' });
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

function toClient(row) {
    return {
        id:              row.id,
        title:           row.title,
        slug:            row.slug,
        description:     row.description,
        icon:            row.icon,
        requirements:    row.requirements || [],
        duration:        row.duration,
        relatedService:  row.related_service,
        metaTitle:       row.meta_title,
        metaDescription: row.meta_desc,
        createdAt:       row.created_at,
        updatedAt:       row.updated_at,
    };
}

module.exports = router;
