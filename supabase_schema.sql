-- ============================================================
-- GymTrack Pro — Schema LENGKAP (fresh install)
-- Gunakan file ini kalau belum ada tabel sama sekali
-- Kalau tabel sudah ada → gunakan supabase_migration.sql
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
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Compositions — Body Breakdown (kg)
  weight_kg               NUMERIC(5,2),
  water_total_kg          NUMERIC(5,2),
  body_fat_kg             NUMERIC(5,2),
  protein_kg              NUMERIC(4,2),
  muscle_kg               NUMERIC(5,2),

  -- Compositions — Persentase & Indeks
  bmi                     NUMERIC(4,1),
  fat_rate                NUMERIC(4,1),
  whr                     NUMERIC(4,2),
  vfal                    NUMERIC(4,1),
  obesity_percentage      NUMERIC(5,1),
  bmr_kcal                INTEGER,
  subskin_fat_rate        NUMERIC(4,1),
  muscle_rate             NUMERIC(4,1),

  -- Extended Compositions
  skeletal_muscle_kg      NUMERIC(5,2),
  mineral_kg              NUMERIC(4,2),
  bone_kg                 NUMERIC(4,2),
  fat_free_mass_kg        NUMERIC(5,2),
  water_ecw_kg            NUMERIC(5,2),
  water_icw_kg            NUMERIC(5,2),
  cell_kg                 NUMERIC(5,2),
  subskin_fat_kg          NUMERIC(5,2),

  -- Suggestions
  body_type               TEXT,
  dci_kcal                INTEGER,
  score                   INTEGER,
  body_age                INTEGER,
  ideal_weight_kg         NUMERIC(5,2),
  weight_control_kg       NUMERIC(5,2),
  fat_control_kg          NUMERIC(5,2),
  muscle_control_kg       NUMERIC(5,2),

  -- Segments — Fat (kg)
  right_arm_fat_kg        NUMERIC(4,2),
  left_arm_fat_kg         NUMERIC(4,2),
  trunk_fat_kg            NUMERIC(5,2),
  right_leg_fat_kg        NUMERIC(4,2),
  left_leg_fat_kg         NUMERIC(4,2),

  -- Segments — Muscle (kg)
  trunk_muscle_kg         NUMERIC(5,2),
  right_arm_muscle_kg     NUMERIC(4,2),
  left_arm_muscle_kg      NUMERIC(4,2),
  right_leg_muscle_kg     NUMERIC(4,2),
  left_leg_muscle_kg      NUMERIC(4,2),

  -- Segments — Fat Rate (%)
  right_arm_fat_rate      NUMERIC(6,1),
  left_arm_fat_rate       NUMERIC(6,1),
  trunk_fat_rate          NUMERIC(6,1),
  right_leg_fat_rate      NUMERIC(6,1),
  left_leg_fat_rate       NUMERIC(6,1)
);

CREATE INDEX IF NOT EXISTS idx_measurements_client_date
  ON bodyin_measurements (client_id, measured_at DESC);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodyin_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage measurements" ON bodyin_measurements;

CREATE POLICY "Authenticated users can manage clients"
  ON clients FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage measurements"
  ON bodyin_measurements FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
