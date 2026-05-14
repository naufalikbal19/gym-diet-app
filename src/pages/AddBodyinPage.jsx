import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Scale, ChevronRight } from 'lucide-react'

// ---------- reusable field ----------
function F({ label, name, unit, placeholder, form, set, step = '0.1', min, max, type = 'number' }) {
  return (
    <div>
      <label className="label">
        {label}
        {unit && <span className="ml-1 text-gray-600 text-xs">({unit})</span>}
      </label>
      <input
        className="input"
        type={type}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder ?? ''}
        value={form[name] ?? ''}
        onChange={e => set(prev => ({ ...prev, [name]: e.target.value }))}
      />
    </div>
  )
}

// ---------- section header ----------
function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">{title}</p>
      {children}
    </div>
  )
}

// ---------- tab button ----------
function Tab({ label, active, onClick, index }) {
  const colors = ['text-blue-400 border-blue-500', 'text-violet-400 border-violet-500', 'text-emerald-400 border-emerald-500', 'text-orange-400 border-orange-500']
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
        active ? colors[index] : 'text-gray-500 border-transparent hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

const TABS = ['Compositions', 'Segments', 'Suggestions', 'Extended']

const EMPTY = {
  measured_at: new Date().toISOString().slice(0, 10),
  // Compositions — breakdown kg (layar baru)
  weight_kg: '', water_total_kg: '', body_fat_kg: '', protein_kg: '', muscle_kg: '',
  // Compositions — indeks & persentase (layar 1)
  bmi: '', fat_rate: '', whr: '', vfal: '',
  obesity_percentage: '', bmr_kcal: '', subskin_fat_rate: '', muscle_rate: '',
  // Extended compositions (layar 5)
  skeletal_muscle_kg: '', mineral_kg: '', bone_kg: '', fat_free_mass_kg: '',
  water_ecw_kg: '', water_icw_kg: '', cell_kg: '', subskin_fat_kg: '',
  // Suggestions
  body_type: '', dci_kcal: '', score: '', body_age: '',
  ideal_weight_kg: '', weight_control_kg: '', fat_control_kg: '', muscle_control_kg: '',
  // Segments - fat kg
  right_arm_fat_kg: '', left_arm_fat_kg: '', trunk_fat_kg: '',
  right_leg_fat_kg: '', left_leg_fat_kg: '',
  // Segments - muscle kg
  trunk_muscle_kg: '', right_arm_muscle_kg: '', left_arm_muscle_kg: '',
  right_leg_muscle_kg: '', left_leg_muscle_kg: '',
  // Segments - fat rate
  right_arm_fat_rate: '', left_arm_fat_rate: '', trunk_fat_rate: '',
  right_leg_fat_rate: '', left_leg_fat_rate: '',
}

const NUM_FIELDS = [
  'weight_kg', 'water_total_kg', 'body_fat_kg', 'protein_kg', 'muscle_kg',
  'bmi', 'fat_rate', 'whr', 'vfal', 'obesity_percentage',
  'bmr_kcal', 'subskin_fat_rate', 'muscle_rate',
  'skeletal_muscle_kg', 'mineral_kg', 'bone_kg', 'fat_free_mass_kg',
  'water_ecw_kg', 'water_icw_kg', 'cell_kg', 'subskin_fat_kg',
  'dci_kcal', 'score', 'body_age', 'ideal_weight_kg',
  'weight_control_kg', 'fat_control_kg', 'muscle_control_kg',
  'right_arm_fat_kg', 'left_arm_fat_kg', 'trunk_fat_kg', 'right_leg_fat_kg', 'left_leg_fat_kg',
  'trunk_muscle_kg', 'right_arm_muscle_kg', 'left_arm_muscle_kg', 'right_leg_muscle_kg', 'left_leg_muscle_kg',
  'right_arm_fat_rate', 'left_arm_fat_rate', 'trunk_fat_rate', 'right_leg_fat_rate', 'left_leg_fat_rate',
]

export default function AddBodyinPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('clients').select('name, height_cm, goal, gender').eq('id', id).single()
      .then(({ data }) => setClient(data))
  }, [id])

  // Auto-calculate BMI
  useEffect(() => {
    if (form.weight_kg && client?.height_cm) {
      const h = client.height_cm / 100
      const bmi = (parseFloat(form.weight_kg) / (h * h)).toFixed(1)
      setForm(prev => ({ ...prev, bmi }))
    }
  }, [form.weight_kg, client])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const payload = { client_id: id, measured_at: form.measured_at }
    if (form.body_type) payload.body_type = form.body_type
    NUM_FIELDS.forEach(f => {
      if (form[f] !== '' && form[f] !== undefined) payload[f] = parseFloat(form[f])
    })
    const { error } = await supabase.from('bodyin_measurements').insert([payload])
    if (error) { setError(error.message); setLoading(false); return }
    navigate(`/clients/${id}`)
  }

  const p = (name, label, unit, placeholder, extra = {}) => (
    <F key={name} name={name} label={label} unit={unit} placeholder={placeholder} form={form} set={setForm} {...extra} />
  )

  // Row of 2 inputs
  function Row({ children }) {
    return <div className="grid grid-cols-2 gap-3">{children}</div>
  }

  // 4-column grid for segments
  function BodyMap({ title, fields }) {
    return (
      <div className="bg-gray-800/40 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        {/* Visual body map */}
        <div className="relative">
          {/* Center trunk */}
          <div className="flex justify-center mb-2">
            <div className="w-52">
              <p className="text-xs text-center text-gray-500 mb-1">Trunk</p>
              <F name={fields.trunk} label="" unit={fields.unit} placeholder="0.0" form={form} set={setForm} />
            </div>
          </div>
          {/* Arms row */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Right Arm</p>
              <F name={fields.rightArm} label="" unit={fields.unit} placeholder="0.0" form={form} set={setForm} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Left Arm</p>
              <F name={fields.leftArm} label="" unit={fields.unit} placeholder="0.0" form={form} set={setForm} />
            </div>
          </div>
          {/* Legs row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Right Leg</p>
              <F name={fields.rightLeg} label="" unit={fields.unit} placeholder="0.0" form={form} set={setForm} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Left Leg</p>
              <F name={fields.leftLeg} label="" unit={fields.unit} placeholder="0.0" form={form} set={setForm} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/clients/${id}`} className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" /> Input Data BodyIn
          </h1>
          {client && <p className="text-gray-500 text-sm mt-0.5">Klien: <span className="text-gray-300 font-medium">{client.name}</span></p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div className="card">
          <label className="label">Tanggal Pengukuran</label>
          <input
            className="input"
            type="date"
            value={form.measured_at}
            onChange={e => setForm(prev => ({ ...prev, measured_at: e.target.value }))}
            required
          />
        </div>

        {/* Tabs */}
        <div className="card p-0 overflow-hidden">
          {/* Tab bar — mirip layar mesin */}
          <div className="flex border-b border-gray-800 px-4 overflow-x-auto bg-gray-900/80">
            {TABS.map((t, i) => (
              <Tab key={t} label={t} active={tab === i} onClick={() => setTab(i)} index={i} />
            ))}
          </div>

          <div className="p-5 space-y-6">
            {/* ===== TAB 0: COMPOSITIONS ===== */}
            {tab === 0 && (
              <>
                <Section title="Body Breakdown (kg)">
                  <p className="text-xs text-gray-600 -mt-2">Layar Compositions utama mesin BodyIn</p>
                  <Row>
                    {p('weight_kg', 'Weight', 'kg', '71.3')}
                    {p('water_total_kg', 'Water', 'kg', '36.7')}
                  </Row>
                  <Row>
                    {p('body_fat_kg', 'Body Fat', 'kg', '19.2')}
                    {p('protein_kg', 'Protein', 'kg', '9.9')}
                  </Row>
                  <Row>
                    {p('muscle_kg', 'Muscle', 'kg', '46.6')}
                    {p('bmi', 'BMI', 'kg/m²', 'auto-hitung')}
                  </Row>
                </Section>

                <Section title="Persentase & Indeks">
                  <p className="text-xs text-gray-600 -mt-2">Layar Compositions ke-2 mesin BodyIn</p>
                  <Row>
                    {p('fat_rate', 'Fat Rate', '%', '26.9')}
                    {p('muscle_rate', 'Muscle Rate', '%', '65.3')}
                  </Row>
                  <Row>
                    {p('whr', 'WHR', '', '0.9', { step: '0.01' })}
                    {p('vfal', 'VFAL (Visceral Fat)', 'level', '9', { step: '1' })}
                  </Row>
                  <Row>
                    {p('obesity_percentage', 'Obesity', '%', '114.0')}
                    {p('subskin_fat_rate', 'Subskin Fat Rate', '%', '26.2')}
                  </Row>
                  <Row>
                    {p('bmr_kcal', 'BMR', 'Kcal', '1452', { step: '1' })}
                  </Row>
                </Section>
              </>
            )}

            {/* ===== TAB 1: SEGMENTS ===== */}
            {tab === 1 && (
              <>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <span>Input nilai per segmen tubuh sesuai layar mesin</span>
                </div>

                <BodyMap
                  title="Fat (kg)"
                  fields={{
                    unit: 'kg',
                    trunk: 'trunk_fat_kg',
                    rightArm: 'right_arm_fat_kg',
                    leftArm: 'left_arm_fat_kg',
                    rightLeg: 'right_leg_fat_kg',
                    leftLeg: 'left_leg_fat_kg',
                  }}
                />

                <BodyMap
                  title="Muscle (kg)"
                  fields={{
                    unit: 'kg',
                    trunk: 'trunk_muscle_kg',
                    rightArm: 'right_arm_muscle_kg',
                    leftArm: 'left_arm_muscle_kg',
                    rightLeg: 'right_leg_muscle_kg',
                    leftLeg: 'left_leg_muscle_kg',
                  }}
                />

                <BodyMap
                  title="Fat Rate (%)"
                  fields={{
                    unit: '%',
                    trunk: 'trunk_fat_rate',
                    rightArm: 'right_arm_fat_rate',
                    leftArm: 'left_arm_fat_rate',
                    rightLeg: 'right_leg_fat_rate',
                    leftLeg: 'left_leg_fat_rate',
                  }}
                />
              </>
            )}

            {/* ===== TAB 2: SUGGESTIONS ===== */}
            {tab === 2 && (
              <>
                <Section title="Body Analysis">
                  <Row>
                    <div>
                      <label className="label">Body Type</label>
                      <input
                        className="input"
                        type="text"
                        placeholder="e.g. Fat muscle"
                        value={form.body_type}
                        onChange={e => setForm(prev => ({ ...prev, body_type: e.target.value }))}
                      />
                    </div>
                    {p('score', 'Score', '', '65', { step: '1' })}
                  </Row>
                  <Row>
                    {p('body_age', 'Body Age', 'tahun', '28', { step: '1' })}
                    {p('dci_kcal', 'DCI (Daily Cal. Intake)', 'Kcal', '1887', { step: '1' })}
                  </Row>
                </Section>

                <Section title="Weight Control Target">
                  <Row>
                    {p('ideal_weight_kg', 'Ideal Weight', 'kg', '62.1')}
                    {p('weight_control_kg', 'Weight Control', 'kg', '-9.2')}
                  </Row>
                  <Row>
                    {p('fat_control_kg', 'Fat Control', 'kg', '-11.8')}
                    {p('muscle_control_kg', 'Muscle Control', 'kg', '2.6')}
                  </Row>
                </Section>
              </>
            )}

            {/* ===== TAB 3: EXTENDED COMPOSITIONS ===== */}
            {tab === 3 && (
              <>
                <Section title="Skeletal & Mass">
                  <Row>
                    {p('skeletal_muscle_kg', 'Skeletal Muscle', 'kg', '27.8')}
                    {p('fat_free_mass_kg', 'Fat-Free Mass (Remove fat)', 'kg', '50.1')}
                  </Row>
                  <Row>
                    {p('mineral_kg', 'Mineral', 'kg', '3.5')}
                    {p('bone_kg', 'Bone', 'kg', '2.8')}
                  </Row>
                  <Row>
                    {p('subskin_fat_kg', 'Subskin Fat', 'kg', '18.7')}
                    {p('cell_kg', 'Cell', 'kg', '33.0')}
                  </Row>
                </Section>

                <Section title="Body Water">
                  <Row>
                    {p('water_ecw_kg', 'Water ECW (Extracellular)', 'kg', '23.0')}
                    {p('water_icw_kg', 'Water ICW (Intracellular)', 'kg', '13.6')}
                  </Row>
                </Section>
              </>
            )}
          </div>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => setTab(t => Math.max(0, t - 1))}
            disabled={tab === 0}
          >
            ← Tab Sebelumnya
          </button>
          {tab < TABS.length - 1 ? (
            <button
              type="button"
              className="btn-primary flex items-center gap-1 text-sm"
              onClick={() => setTab(t => t + 1)}
            >
              Tab Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Link to={`/clients/${id}`} className="btn-secondary flex-1 text-center">Batal</Link>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Menyimpan...' : '💾 Simpan Semua Data'}
          </button>
        </div>
      </form>
    </div>
  )
}
