const { Pool } = require('pg');

const url = process.env.DATABASE_URL || '';

/**
 * SSL ni qachon yoqish kerak?
 *
 * Railway ikki xil manzil beradi:
 *   - ichki (private) tarmoq: postgres.railway.internal — TLS ISHLATMAYDI.
 *     Bunga SSL bilan ulanishga urinish "The server does not support SSL
 *     connections" xatosiga olib keladi.
 *   - ommaviy proxy: *.proxy.rlwy.net va shunga o'xshash — SSL TALAB QILADI.
 *
 * Ilgari shart `url.includes('railway')` edi, ya'ni ichki manzilga ham SSL
 * yoqilardi va ulanish uzilardi.
 *
 * PGSSLMODE=disable / require orqali qo'lda ham boshqarish mumkin.
 */
function resolveSsl() {
    const mode = (process.env.PGSSLMODE || '').toLowerCase();
    if (mode === 'disable') return false;
    if (mode === 'require' || mode === 'no-verify') return { rejectUnauthorized: false };

    if (!url) return false;

    const isInternal = url.includes('.railway.internal')
        || url.includes('localhost')
        || url.includes('127.0.0.1');

    return isInternal ? false : { rejectUnauthorized: false };
}

const pool = new Pool({
    connectionString: url,
    ssl: resolveSsl(),
});

// Ulanishni tekshirish
pool.on('connect', () => {
    console.log('✅ PostgreSQL ga ulandi');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL xatosi:', err.message);
});

module.exports = pool;
