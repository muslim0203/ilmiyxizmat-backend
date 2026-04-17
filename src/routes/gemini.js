const express   = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Gemini ga: kuniga max 50 so'rov / IP (spam himoyasi)
const geminiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 50,
    message: { error: 'Kunlik limit tugadi. Ertaga qayta urining.' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/gemini/generate
 * Body: { prompt: string, model?: string }
 * Javob: { text: string }
 *
 * Gemini API key backend da yashirin — frontendga hech qachon chiqmaydi
 */
router.post('/generate', geminiLimiter, async (req, res) => {
    try {
        const { prompt, model = 'gemini-2.5-flash' } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'prompt maydoni talab qilinadi.' });
        }

        if (prompt.length > 5000) {
            return res.status(400).json({ error: 'Prompt juda uzun (max 5000 belgi).' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API konfiguratsiya xatosi.' });
        }

        // Google Gemini REST API ga to'g'ridan-to'g'ri so'rov
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                }
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Gemini API xatosi:', errData);
            return res.status(502).json({ error: 'Gemini API xatosi. Qayta urining.' });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(502).json({ error: 'Gemini bo\'sh javob qaytardi.' });
        }

        res.json({ text });
    } catch (err) {
        console.error('Gemini proxy xatosi:', err);
        res.status(500).json({ error: 'Serverda xatolik.' });
    }
});

module.exports = router;
