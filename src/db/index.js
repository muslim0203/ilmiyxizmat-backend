const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production' ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Ulanishni tekshirish
pool.on('connect', () => {
    console.log('✅ PostgreSQL ga ulandi');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL xatosi:', err.message);
});

module.exports = pool;
