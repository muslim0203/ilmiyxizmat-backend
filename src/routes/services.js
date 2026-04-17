const express     = require('express');
const pool        = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ── Ommaviy endpointlar (auth shart emas) ────────────────────

// GET /api/services — barcha xizmatlar
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM services ORDER BY id ASC'
        );
        res.json(rows.map(toClient));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// GET /api/services/popular — mashhur xizmatlar (bosh sahifa uchun)
router.get('/popular', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM services WHERE popular = TRUE ORDER BY id ASC'
        );
        res.json(rows.map(toClient));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// GET /api/services/:slug — bitta xizmat (slug bo'yicha)
router.get('/:slug', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM services WHERE slug = $1',
            [req.params.slug]
        );
        if (!rows.length) return res.status(404).json({ error: 'Topilmadi.' });
        res.json(toClient(rows[0]));
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// ── Admin endpointlar (JWT shart) ────────────────────────────

// POST /api/services — yangi xizmat
router.post('/', requireAuth, async (req, res) => {
    try {
        const d = req.body;
        const { rows } = await pool.query(`
            INSERT INTO services
                (title, short_title, slug, description, icon, features,
                 price, price_note, popular, meta_title, meta_desc)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *`,
            [d.title, d.shortTitle, d.slug, d.description, d.icon,
             JSON.stringify(d.features || []),
             d.price, d.priceNote, d.popular || false,
             d.metaTitle, d.metaDescription]
        );
        res.status(201).json(toClient(rows[0]));
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Bu slug allaqachon mavjud.' });
        console.error(err);
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// PUT /api/services/:id — xizmatni yangilash
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const d = req.body;
        const { rows } = await pool.query(`
            UPDATE services SET
                title=$1, short_title=$2, slug=$3, description=$4, icon=$5,
                features=$6, price=$7, price_note=$8, popular=$9,
                meta_title=$10, meta_desc=$11
            WHERE id=$12
            RETURNING *`,
            [d.title, d.shortTitle, d.slug, d.description, d.icon,
             JSON.stringify(d.features || []),
             d.price, d.priceNote, d.popular || false,
             d.metaTitle, d.metaDescription,
             req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Topilmadi.' });
        res.json(toClient(rows[0]));
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Bu slug allaqachon mavjud.' });
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// DELETE /api/services/:id — xizmatni o'chirish
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { rowCount } = await pool.query(
            'DELETE FROM services WHERE id = $1',
            [req.params.id]
        );
        if (!rowCount) return res.status(404).json({ error: 'Topilmadi.' });
        res.json({ message: 'O\'chirildi.' });
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// ── Helper: DB ustunlar → frontend kalit nomlari ─────────────
function toClient(row) {
    return {
        id:              row.id,
        title:           row.title,
        shortTitle:      row.short_title,
        slug:            row.slug,
        description:     row.description,
        icon:            row.icon,
        features:        row.features || [],
        price:           row.price,
        priceNote:       row.price_note,
        popular:         row.popular,
        metaTitle:       row.meta_title,
        metaDescription: row.meta_desc,
        createdAt:       row.created_at,
        updatedAt:       row.updated_at,
    };
}

module.exports = router;
