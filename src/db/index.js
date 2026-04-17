const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});

// Ulanishni tekshirish
pool.on('connect', () => {
    console.log('✅ PostgreSQL ga ulandi');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL xatosi:', err.message);
});

module.exports = pool;
