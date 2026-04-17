const express     = require('express');
const pool        = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings — barcha sozlamalarni ob'ekt sifatida qaytarish
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT key, value FROM site_settings');
        // [{key:'phone', value:'...'}, ...] → {phone:'...', ...}
        const settings = Object.fromEntries(rows.map(r => [toCamel(r.key), r.value]));
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// PUT /api/settings — sozlamalarni yangilash (admin)
router.put('/', requireAuth, async (req, res) => {
    try {
        const updates = req.body; // { phone: '...', telegramUrl: '...', ... }

        // Har bir kalit uchun upsert qilamiz
        const keys = Object.keys(updates);
        for (const camelKey of keys) {
            const dbKey = toSnake(camelKey);
            await pool.query(`
                INSERT INTO site_settings (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
                [dbKey, updates[camelKey]]
            );
        }

        // Yangilangan sozlamalarni qaytaramiz
        const { rows } = await pool.query('SELECT key, value FROM site_settings');
        const settings = Object.fromEntries(rows.map(r => [toCamel(r.key), r.value]));
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

// snake_case → camelCase: phone_raw → phoneRaw
function toCamel(str) {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// camelCase → snake_case: phoneRaw → phone_raw
function toSnake(str) {
    return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}

module.exports = router;
