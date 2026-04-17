# Railway Deploy Qo'llanmasi — ilmiyxizmat-backend

## 1. Railway ga kirish
https://railway.app → GitHub bilan login

## 2. Yangi loyiha yaratish
1. "New Project" → "Deploy from GitHub repo"
2. `ilmiyxizmat-backend` reponi tanlash

## 3. PostgreSQL qo'shish
1. Loyiha ichida: "+ New" → "Database" → "Add PostgreSQL"
2. `DATABASE_URL` avtomatik qo'shiladi

## 4. Muhit o'zgaruvchilarini sozlash
Variables bo'limiga quyidagilarni qo'shing:

```
JWT_SECRET=<kamida 32 ta tasodifiy belgi, masalan: openssl rand -hex 32>
ADMIN_PASSWORD_HASH=<bcrypt hash — pastdagi usul bilan yarating>
FRONTEND_URL=https://ilmiyxizmat.uz
GEMINI_API_KEY=<Google AI Studio dan olingan kalit>
```

### Parol hash yaratish:
```bash
node src/scripts/generate-hash.js
# parolingizni kiriting → hash ko'rsatiladi → ADMIN_PASSWORD_HASH ga joylashtiring
```

## 5. Ma'lumotlar bazasini ishga tushirish
Railway "Run command" yoki local terminal:
```bash
DATABASE_URL="postgresql://..." node src/db/init.js
```

## 6. Deploy
Railway avtomatik deploy qiladi. 
Health check: `https://your-app.up.railway.app/health`

## 7. Frontend .env ni yangilash
`D:\Dasturlarim\ilmiyxizmat\.env`:
```
VITE_API_URL=https://your-app.up.railway.app
```

## 8. Frontend ni qayta build qilish
```bash
cd D:\Dasturlarim\ilmiyxizmat
npm run build
```
`dist/` papkasini hosting ga deploy qiling (Vercel, Netlify yoki boshqa).
