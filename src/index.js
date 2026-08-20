require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// ── CORS ──────────────────────────────────────────────────────
const corsOptions = {
    origin: true,   // barcha originlarga ruxsat (keyinchalik cheklash mumkin)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// OPTIONS preflight barcha route lar uchun
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ── Body parser ───────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Umumiy rate limit (DDoS himoyasi) ────────────────────────
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 300,                  // har IP uchun max 300 so'rov
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Juda ko\'p so\'rov. Biroz kuting.' },
}));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/services',     require('./routes/services'));
app.use('/api/blog',         require('./routes/blog'));
app.use('/api/works',        require('./routes/works'));
app.use('/api/publications', require('./routes/publications'));
app.use('/api/faq',          require('./routes/faq'));
app.use('/api/settings',     require('./routes/settings'));
app.use('/api/gemini',       require('./routes/gemini'));

// ── Health check (Railway monitoring uchun) ───────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
    });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `${req.method} ${req.path} — endpoint topilmadi.` });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Kutilmagan xatolik:', err);
    res.status(500).json({ error: 'Serverda kutilmagan xatolik yuz berdi.' });
});

// ── Ma'lumotlar bazasi sxemasini tayyorlash ───────────────────
// Ilgari buni qo'lda `node src/db/init.js` orqali bajarish kerak edi. Agar
// unutilsa (yoki Postgres volume yangi bo'lsa) jadvallar yaratilmay qolib,
// barcha API endpointlar 500 qaytarardi. Sxema CREATE TABLE IF NOT EXISTS
// asosida qurilgani uchun uni har ishga tushishda bajarish xavfsiz.
async function ensureSchema() {
    const fs   = require('fs');
    const path = require('path');
    const pool = require('./db');

    const sql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await pool.query(sql);
}

// ── Server ishga tushirish ────────────────────────────────────
const PORT = process.env.PORT || 3000;

ensureSchema()
    .then(() => console.log('✅ Sxema tayyor (jadvallar mavjud).'))
    .catch(err => {
        // Bazaga ulanib bo'lmasa ham serverni to'xtatmaymiz: /health ishlab
        // tursin va xatoning aniq sababi loglarda ko'rinsin.
        console.error('❌ Sxema tayyorlanmadi. Baza ulanishini tekshiring:', err.message);
    })
    .finally(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server ishlamoqda: http://localhost:${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    });
