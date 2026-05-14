-- ============================================================
-- GymTrack Pro — MIGRATION (jalankan ini kalau tabel sudah ada)
-- Aman dijalankan berulang kali (IF NOT EXISTS di semua ALTER)
-- ============================================================

-- ── Tambah kolom baru ke bodyin_measurements ──────────────────

-- Body breakdown (kg) — dari layar Compositions utama mesin
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS water_total_kg      NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS body_fat_kg         NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS protein_kg          NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS muscle_kg           NUMERIC(5,2);

-- Persentase & indeks — layar Compositions ke-2
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS fat_rate            NUMERIC(4,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS whr                 NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS vfal                NUMERIC(4,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS obesity_percentage  NUMERIC(5,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS subskin_fat_rate    NUMERIC(4,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS muscle_rate         NUMERIC(4,1);

-- Extended compositions — layar 5 mesin
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS skeletal_muscle_kg  NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS mineral_kg          NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS bone_kg             NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS fat_free_mass_kg    NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS water_ecw_kg        NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS water_icw_kg        NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS cell_kg             NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS subskin_fat_kg      NUMERIC(5,2);

-- Suggestions — layar 4 mesin
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS body_type           TEXT;
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS dci_kcal            INTEGER;
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS score               INTEGER;
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS body_age            INTEGER;
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS ideal_weight_kg     NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS weight_control_kg   NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS fat_control_kg      NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS muscle_control_kg   NUMERIC(5,2);

-- Segments — Fat (kg) — layar 2 mesin
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS right_arm_fat_kg    NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS left_arm_fat_kg     NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS trunk_fat_kg        NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS right_leg_fat_kg    NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS left_leg_fat_kg     NUMERIC(4,2);

-- Segments — Muscle (kg) — layar 2 mesin
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS trunk_muscle_kg     NUMERIC(5,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS right_arm_muscle_kg NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS left_arm_muscle_kg  NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS right_leg_muscle_kg NUMERIC(4,2);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS left_leg_muscle_kg  NUMERIC(4,2);

-- Segments — Fat Rate (%) — layar 3 mesin
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS right_arm_fat_rate  NUMERIC(6,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS left_arm_fat_rate   NUMERIC(6,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS trunk_fat_rate      NUMERIC(6,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS right_leg_fat_rate  NUMERIC(6,1);
ALTER TABLE bodyin_measurements ADD COLUMN IF NOT EXISTS left_leg_fat_rate   NUMERIC(6,1);

-- ── Index (aman dijalankan ulang) ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_measurements_client_date
  ON bodyin_measurements (client_id, measured_at DESC);

-- ── RLS Policy (drop dulu agar tidak error duplicate) ─────────
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

-- ── Selesai ───────────────────────────────────────────────────
-- Verifikasi: jalankan query ini untuk cek kolom yang ada:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'bodyin_measurements' ORDER BY ordinal_position;
