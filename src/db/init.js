/**
 * Ma'lumotlar bazasini ishga tushirish skripti
 * Ishlatish: node src/db/init.js
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const pool = require('./index');

async function init() {
    const client = await pool.connect();
    try {
        console.log('🔄 Schema yaratilmoqda...');
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ Schema muvaffaqiyatli yaratildi!');
    } catch (err) {
        console.error('❌ Xatolik:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

init();
