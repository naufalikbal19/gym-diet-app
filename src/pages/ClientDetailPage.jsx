import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Trash2, Scale, Dumbbell, Salad, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const goalLabel = { cut: 'Turun BB', bulk: 'Naik BB', maintain: 'Maintenance', toning: 'Toning' }

function bmiStatus(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return { label: 'Kurus', cls: 'badge-warn' }
  if (bmi < 25)   return { label: 'Normal', cls: 'badge-good' }
  if (bmi < 30)   return { label: 'Gemuk', cls: 'badge-warn' }
  return { label: 'Obesitas', cls: 'badge-bad' }
}

function StatBox({ label, value, unit = '', badge }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-bold text-white">{value ?? '-'}{value && unit}</p>
        {badge && <span className={badge.cls}>{badge.label}</span>}
      </div>
    </div>
  )
}

// Expandable measurement detail card
function MeasurementCard({ m, onDelete }) {
  const [open, setOpen] = useState(false)

  const rows = [
    // Compositions — body breakdown kg
    { label: 'Berat (Weight)', val: m.weight_kg, unit: 'kg' },
    { label: 'Water (Total)', val: m.water_total_kg, unit: 'kg' },
    { label: 'Body Fat', val: m.body_fat_kg, unit: 'kg' },
    { label: 'Protein', val: m.protein_kg, unit: 'kg' },
    { label: 'Muscle', val: m.muscle_kg, unit: 'kg' },
    // Compositions — indeks
    { label: 'BMI', val: m.bmi, unit: '' },
    { label: 'Fat Rate', val: m.fat_rate, unit: '%' },
    { label: 'Muscle Rate', val: m.muscle_rate, unit: '%' },
    { label: 'WHR', val: m.whr, unit: '' },
    { label: 'VFAL', val: m.vfal, unit: '' },
    { label: 'Obesity', val: m.obesity_percentage, unit: '%' },
    { label: 'BMR', val: m.bmr_kcal, unit: ' Kcal' },
    { label: 'Subskin Fat Rate', val: m.subskin_fat_rate, unit: '%' },
    // Extended
    { label: 'Skeletal Muscle', val: m.skeletal_muscle_kg, unit: 'kg' },
    { label: 'Bone', val: m.bone_kg, unit: 'kg' },
    { label: 'Mineral', val: m.mineral_kg, unit: 'kg' },
    { label: 'Fat-Free Mass', val: m.fat_free_mass_kg, unit: 'kg' },
    { label: 'Subskin Fat', val: m.subskin_fat_kg, unit: 'kg' },
    { label: 'Water ECW', val: m.water_ecw_kg, unit: 'kg' },
    { label: 'Water ICW', val: m.water_icw_kg, unit: 'kg' },
    { label: 'Cell', val: m.cell_kg, unit: 'kg' },
    // Suggestions
    { label: 'Body Type', val: m.body_type, unit: '' },
    { label: 'Score', val: m.score, unit: '' },
    { label: 'Body Age', val: m.body_age, unit: ' thn' },
    { label: 'DCI', val: m.dci_kcal, unit: ' Kcal' },
    { label: 'Ideal Weight', val: m.ideal_weight_kg, unit: 'kg' },
    { label: 'Weight Control', val: m.weight_control_kg, unit: 'kg' },
    { label: 'Fat Control', val: m.fat_control_kg, unit: 'kg' },
    { label: 'Muscle Control', val: m.muscle_control_kg, unit: 'kg' },
  ].filter(r => r.val !== null && r.val !== undefined && r.val !== '')

  const segments = [
    { label: 'Trunk Fat', val: m.trunk_fat_kg, unit: 'kg' },
    { label: 'R.Arm Fat', val: m.right_arm_fat_kg, unit: 'kg' },
    { label: 'L.Arm Fat', val: m.left_arm_fat_kg, unit: 'kg' },
    { label: 'R.Leg Fat', val: m.right_leg_fat_kg, unit: 'kg' },
    { label: 'L.Leg Fat', val: m.left_leg_fat_kg, unit: 'kg' },
    { label: 'Trunk Muscle', val: m.trunk_muscle_kg, unit: 'kg' },
    { label: 'R.Arm Muscle', val: m.right_arm_muscle_kg, unit: 'kg' },
    { label: 'L.Arm Muscle', val: m.left_arm_muscle_kg, unit: 'kg' },
    { label: 'R.Leg Muscle', val: m.right_leg_muscle_kg, unit: 'kg' },
    { label: 'L.Leg Muscle', val: m.left_leg_muscle_kg, unit: 'kg' },
    { label: 'Trunk Fat Rate', val: m.trunk_fat_rate, unit: '%' },
    { label: 'R.Arm Fat Rate', val: m.right_arm_fat_rate, unit: '%' },
    { label: 'L.Arm Fat Rate', val: m.left_arm_fat_rate, unit: '%' },
    { label: 'R.Leg Fat Rate', val: m.right_leg_fat_rate, unit: '%' },
    { label: 'L.Leg Fat Rate', val: m.left_leg_fat_rate, unit: '%' },
  ].filter(r => r.val !== null && r.val !== undefined && r.val !== '')

  return (
    <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 overflow-hidden">
      {/* Summary row */}
      <div className="flex items-start justify-between p-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-200">
            {new Date(m.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
            {m.weight_kg     && <span className="text-xs text-gray-500">BB: <b className="text-gray-200">{m.weight_kg} kg</b></span>}
            {m.bmi           && <span className="text-xs text-gray-500">BMI: <b className="text-gray-200">{m.bmi}</b></span>}
            {m.fat_rate      && <span className="text-xs text-gray-500">Fat: <b className="text-gray-200">{m.fat_rate}%</b></span>}
            {m.muscle_rate   && <span className="text-xs text-gray-500">Muscle: <b className="text-gray-200">{m.muscle_rate}%</b></span>}
            {m.vfal          && <span className="text-xs text-gray-500">VFAL: <b className="text-gray-200">{m.vfal}</b></span>}
            {m.score         && <span className="text-xs text-gray-500">Score: <b className="text-emerald-400">{m.score}</b></span>}
            {m.body_type     && <span className="text-xs text-gray-500">Type: <b className="text-gray-200">{m.body_type}</b></span>}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-500 hover:text-gray-300 p-1 cursor-pointer"
            title="Lihat detail"
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(m.id)}
            className="text-gray-600 hover:text-red-400 p-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-700 p-3 space-y-4">
          {rows.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Compositions & Suggestions</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rows.map(r => (
                  <div key={r.label} className="bg-gray-900/60 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">{r.label}</p>
                    <p className="text-sm font-semibold text-white">{r.val}{r.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {segments.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Segments</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {segments.map(r => (
                  <div key={r.label} className="bg-gray-900/60 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">{r.label}</p>
                    <p className="text-sm font-semibold text-white">{r.val}{r.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartMetric, setChartMetric] = useState('weight_kg')

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('bodyin_measurements').select('*').eq('client_id', id).order('measured_at', { ascending: true }),
      ])
      setClient(c)
      setMeasurements(m || [])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleDelete() {
    if (!confirm(`Hapus klien "${client?.name}"?`)) return
    await supabase.from('clients').delete().eq('id', id)
    navigate('/clients')
  }

  async function deleteMeasurement(mid) {
    if (!confirm('Hapus data pengukuran ini?')) return
    await supabase.from('bodyin_measurements').delete().eq('id', mid)
    setMeasurements(prev => prev.filter(m => m.id !== mid))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>
  if (!client) return <div className="text-center py-20 text-gray-500">Klien tidak ditemukan.</div>

  const latest = measurements[measurements.length - 1]
  const bmiCat = bmiStatus(latest?.bmi)

  const chartData = measurements.map(m => ({
    date: new Date(m.measured_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    'Berat (kg)': m.weight_kg,
    'Body Fat (kg)': m.body_fat_kg,
    'Muscle (kg)': m.muscle_kg,
    'Fat Rate (%)': m.fat_rate,
    'Muscle Rate (%)': m.muscle_rate,
    'BMI': m.bmi,
    'VFAL': m.vfal,
    'Protein (kg)': m.protein_kg,
    'Water (kg)': m.water_total_kg,
  }))

  const CHART_METRICS = [
    { key: 'Berat (kg)', color: '#10b981' },
    { key: 'Body Fat (kg)', color: '#f59e0b' },
    { key: 'Muscle (kg)', color: '#3b82f6' },
    { key: 'Fat Rate (%)', color: '#fb923c' },
    { key: 'Muscle Rate (%)', color: '#60a5fa' },
    { key: 'BMI', color: '#a78bfa' },
    { key: 'VFAL', color: '#f43f5e' },
    { key: 'Protein (kg)', color: '#34d399' },
    { key: 'Water (kg)', color: '#06b6d4' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/clients" className="btn-secondary p-2 mt-1"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {client.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
            {client.age ? ` · ${client.age} tahun` : ''}
            {client.height_cm ? ` · ${client.height_cm} cm` : ''}
            {client.phone ? ` · ${client.phone}` : ''}
          </p>
        </div>
        <button onClick={handleDelete} className="btn-danger p-2"><Trash2 className="w-4 h-4" /></button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatBox label="Goal" value={goalLabel[client.goal] || client.goal} />
        <StatBox label="Weight" value={latest?.weight_kg} unit=" kg" />
        <StatBox label="BMI" value={latest?.bmi} badge={bmiCat} />
        <StatBox label="Score" value={latest?.score} />
        <StatBox label="Body Fat" value={latest?.body_fat_kg} unit=" kg" />
        <StatBox label="Muscle" value={latest?.muscle_kg} unit=" kg" />
        <StatBox label="Protein" value={latest?.protein_kg} unit=" kg" />
        <StatBox label="Water (Total)" value={latest?.water_total_kg} unit=" kg" />
        <StatBox label="Fat Rate" value={latest?.fat_rate} unit="%" />
        <StatBox label="Muscle Rate" value={latest?.muscle_rate} unit="%" />
        <StatBox label="VFAL" value={latest?.vfal} />
        <StatBox label="BMR" value={latest?.bmr_kcal} unit=" Kcal" />
        <StatBox label="Body Age" value={latest?.body_age} unit=" thn" />
        <StatBox label="Body Type" value={latest?.body_type} />
        <StatBox label="Ideal Weight" value={latest?.ideal_weight_kg} unit=" kg" />
        <StatBox label="DCI" value={latest?.dci_kcal} unit=" Kcal" />
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-white">Grafik Perkembangan</h3>
            <div className="flex flex-wrap gap-1">
              {CHART_METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setChartMetric(m.key)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                    chartMetric === m.key
                      ? 'text-white border-transparent'
                      : 'text-gray-500 border-gray-700 hover:border-gray-500'
                  }`}
                  style={chartMetric === m.key ? { backgroundColor: m.color + '33', borderColor: m.color, color: m.color } : {}}
                >
                  {m.key}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }} />
              {CHART_METRICS.filter(m => m.key === chartMetric).map(m => (
                <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={{ fill: m.color, r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to={`/clients/${id}/bodyin`} className="card hover:border-emerald-600/50 transition-colors flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 rounded-lg"><Scale className="w-5 h-5 text-emerald-400" /></div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Input BodyIn</p>
            <p className="text-xs text-gray-500">Catat hasil pengukuran</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Link>
        <Link to={`/workout?client=${id}`} className="card hover:border-blue-600/50 transition-colors flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg"><Dumbbell className="w-5 h-5 text-blue-400" /></div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Program Workout</p>
            <p className="text-xs text-gray-500">Rutinitas minggu ini</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Link>
        <Link to={`/diet?client=${id}`} className="card hover:border-orange-600/50 transition-colors flex items-center gap-3">
          <div className="p-2 bg-orange-600/20 rounded-lg"><Salad className="w-5 h-5 text-orange-400" /></div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Menu Diet</p>
            <p className="text-xs text-gray-500">Rekomendasi makanan</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Link>
      </div>

      {/* Measurement History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">
            Riwayat Pengukuran
            <span className="ml-2 text-xs text-gray-500 font-normal">{measurements.length} data</span>
          </h3>
          <Link to={`/clients/${id}/bodyin`} className="btn-primary flex items-center gap-1 text-sm py-1.5">
            <Plus className="w-4 h-4" /> Tambah
          </Link>
        </div>
        {measurements.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Belum ada data pengukuran. Klik "Tambah" untuk input data BodyIn.</p>
        ) : (
          <div className="space-y-2">
            {[...measurements].reverse().map(m => (
              <MeasurementCard key={m.id} m={m} onDelete={deleteMeasurement} />
            ))}
          </div>
        )}
      </div>

      {client.notes && (
        <div className="card">
          <h3 className="font-semibold text-white mb-2">Catatan</h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  )
}
