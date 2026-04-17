/**
 * Admin parol uchun bcrypt hash yaratish
 *
 * Ishlatish:
 *   node src/scripts/generate-hash.js
 *
 * Natijani .env fayliga ADMIN_PASSWORD_HASH= ga qo'ying
 */
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Yangi admin parolini kiriting: ', async (password) => {
    if (!password || password.length < 8) {
        console.error('❌ Parol kamida 8 belgidan iborat bo\'lishi kerak!');
        process.exit(1);
    }
    const hash = await bcrypt.hash(password, 12);
    console.log('\n✅ Muvaffaqiyatli! Quyidagini .env fayliga qo\'ying:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
    rl.close();
});
