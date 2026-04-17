const jwt = require('jsonwebtoken');

/**
 * JWT token tekshiruvchi middleware
 * Foydalanish: router.get('/...', requireAuth, handler)
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token mavjud emas. Iltimos, tizimga kiring.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Sessiya muddati tugagan. Qayta kiring.' });
        }
        return res.status(401).json({ error: 'Token noto\'g\'ri.' });
    }
}

module.exports = { requireAuth };
