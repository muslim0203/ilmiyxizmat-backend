const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Login ga brute-force himoyasi: 15 daqiqada max 10 urinish
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Juda ko\'p urinish. 15 daqiqadan so\'ng qayta urining.' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Body: { password: string }
 * Javob: { token: string, expiresIn: string }
 */
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Parol kiritilmadi.' });
        }

        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) {
            console.error('ADMIN_PASSWORD_HASH .env da yo\'q!');
            return res.status(500).json({ error: 'Server konfiguratsiya xatosi.' });
        }

        const isValid = await bcrypt.compare(password, hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Parol noto\'g\'ri!' });
        }

        const token = jwt.sign(
            { role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, expiresIn: '8h' });
    } catch (err) {
        console.error('Login xatosi:', err);
        res.status(500).json({ error: 'Server xatosi.' });
    }
});

/**
 * POST /api/auth/logout
 * Frontend token ni o'zi o'chiradi — bu endpoint faqat log uchun
 */
router.post('/logout', (req, res) => {
    res.json({ message: 'Chiqildi.' });
});

/**
 * GET /api/auth/me
 * Token ni tekshirish (frontend uchun)
 */
router.get('/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token yo\'q.' });
    }
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        res.json({ role: decoded.role });
    } catch {
        res.status(401).json({ error: 'Token yaroqsiz.' });
    }
});

module.exports = router;
