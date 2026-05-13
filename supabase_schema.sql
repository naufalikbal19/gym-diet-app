-- ============================================================
-- GymTrack Pro — Supabase Schema
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabel klien
CREATE TABLE IF NOT EXISTS clients (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  name        TEXT NOT NULL,
  phone       TEXT,
  gender      TEXT CHECK (gender IN ('male', 'female')) DEFAULT 'male',
  age         INTEGER,
  height_cm   NUMERIC(5,1),
  goal        TEXT CHECK (goal IN ('cut', 'bulk', 'maintain', 'toning')) DEFAULT 'maintain',
  notes       TEXT
);

-- Tabel data pengukuran BodyIn
CREATE TABLE IF NOT EXISTS bodyin_measurements (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at                  TIMESTAMPTZ DEFAULT now(),
  client_id                   UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  measured_at                 DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Data utama dari mesin BodyIn
  weight_kg                   NUMERIC(5,2),       -- Berat badan (kg)
  bmi                         NUMERIC(4,1),       -- Body Mass Index
  body_fat_percentage         NUMERIC(4,1),       -- Persentase lemak tubuh (%)
  muscle_mass_kg              NUMERIC(5,2),       -- Massa otot (kg)

  -- Data tambahan
  bone_mass_kg                NUMERIC(4,2),       -- Massa tulang (kg)
  body_water_percentage       NUMERIC(4,1),       -- Kadar air tubuh (%)
  visceral_fat                NUMERIC(4,1),       -- Level lemak visceral (1-30)
  metabolic_age               INTEGER,            -- Usia metabolik
  bmr_kcal                    INTEGER,            -- Basal Metabolic Rate (kcal/hari)
  protein_percentage          NUMERIC(4,1),       -- Persentase protein (%)
  subcutaneous_fat_percentage NUMERIC(4,1)        -- Lemak subkutan (%)
);

-- Index untuk query yang sering dipakai
CREATE INDEX IF NOT EXISTS idx_measurements_client_date
  ON bodyin_measurements (client_id, measured_at DESC);

-- ============================================================
-- Row Level Security (RLS) — hanya user yang login bisa akses
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodyin_measurements ENABLE ROW LEVEL SECURITY;

-- Policy: semua authenticated user bisa CRUD (untuk admin gym)
CREATE POLICY "Authenticated users can manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage measurements"
  ON bodyin_measurements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Data contoh (opsional — hapus jika tidak perlu)
-- ============================================================

-- INSERT INTO clients (name, phone, gender, age, height_cm, goal) VALUES
--   ('Budi Santoso', '081234567890', 'male', 28, 172.0, 'cut'),
--   ('Sari Dewi', '082345678901', 'female', 25, 160.5, 'toning'),
--   ('Andi Pratama', '083456789012', 'male', 32, 175.0, 'bulk');
