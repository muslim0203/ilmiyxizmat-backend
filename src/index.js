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

// ── Server ishga tushirish ────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server ishlamoqda: http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
