-- ============================================================
-- Ilmiyxizmat.uz — PostgreSQL schema
-- Railway da ishlatish uchun
-- Ishga tushirish: node src/db/init.js
-- ============================================================

-- Xizmatlar jadvali
CREATE TABLE IF NOT EXISTS services (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    short_title TEXT,
    slug        TEXT UNIQUE NOT NULL,
    description TEXT,
    icon        TEXT,
    features    JSONB DEFAULT '[]',
    price       TEXT,
    price_note  TEXT DEFAULT 'dan boshlab',
    popular     BOOLEAN DEFAULT FALSE,
    meta_title  TEXT,
    meta_desc   TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Blog maqolalari jadvali
CREATE TABLE IF NOT EXISTS blog_posts (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    excerpt     TEXT,
    content     TEXT,
    category    TEXT,
    read_time   TEXT,
    date        DATE DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ilmiy ishlar jadvali
CREATE TABLE IF NOT EXISTS scientific_works (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    description     TEXT,
    icon            TEXT,
    requirements    JSONB DEFAULT '[]',
    duration        TEXT,
    related_service TEXT,
    meta_title      TEXT,
    meta_desc       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Nashrlar jadvali
CREATE TABLE IF NOT EXISTS publications (
    id           SERIAL PRIMARY KEY,
    title        TEXT NOT NULL,
    slug         TEXT UNIQUE NOT NULL,
    description  TEXT,
    icon         TEXT,
    price        TEXT,
    timeline     TEXT,
    benefits     JSONB DEFAULT '[]',
    requirements JSONB DEFAULT '[]',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ (Savol-javob) jadvali
CREATE TABLE IF NOT EXISTS faq (
    id         SERIAL PRIMARY KEY,
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sayt sozlamalari jadvali (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default sozlamalar
INSERT INTO site_settings (key, value) VALUES
    ('phone',         '+998 97 007 33 96'),
    ('phone_raw',     '+998970073396'),
    ('telegram',      '@zarifjon0203'),
    ('telegram_url',  'https://t.me/zarifjon0203'),
    ('email',         'info@ilmiyxizmat.uz'),
    ('instagram',     'ilmiyxizmat'),
    ('instagram_url', 'https://instagram.com/ilmiyxizmat'),
    ('working_hours', 'Dush-Shan: 09:00 - 21:00'),
    ('address',       'Toshkent, O''zbekiston')
ON CONFLICT (key) DO NOTHING;

-- updated_at ni avtomatik yangilash uchun funksiya
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggerlar
CREATE OR REPLACE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_blog_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_works_updated_at
    BEFORE UPDATE ON scientific_works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_publications_updated_at
    BEFORE UPDATE ON publications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_faq_updated_at
    BEFORE UPDATE ON faq
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
