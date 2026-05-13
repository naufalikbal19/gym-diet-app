import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Trash2, Scale, Dumbbell, Salad, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const goalLabel = { cut: 'Turun BB', bulk: 'Naik BB', maintain: 'Maintenance', toning: 'Toning' }

function bmiCategory(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return { label: 'Kurus', cls: 'badge-warn' }
  if (bmi < 25) return { label: 'Normal', cls: 'badge-good' }
  if (bmi < 30) return { label: 'Gemuk', cls: 'badge-warn' }
  return { label: 'Obesitas', cls: 'badge-bad' }
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)

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
    if (!confirm(`Hapus klien "${client?.name}"? Semua data pengukuran akan ikut terhapus.`)) return
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
  const bmiCat = bmiCategory(latest?.bmi)

  const chartData = measurements.map(m => ({
    date: new Date(m.measured_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    berat: m.weight_kg,
    lemak: m.body_fat_percentage,
    otot: m.muscle_mass_kg,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/clients" className="btn-secondary p-2 mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {client.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
            {client.age ? ` · ${client.age} tahun` : ''}
            {client.height_cm ? ` · ${client.height_cm} cm` : ''}
            {client.phone ? ` · ${client.phone}` : ''}
          </p>
        </div>
        <button onClick={handleDelete} className="btn-danger p-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Goal</p>
          <p className="font-semibold text-white text-sm">{goalLabel[client.goal] || '-'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Berat Terakhir</p>
          <p className="font-semibold text-white text-sm">{latest?.weight_kg ? `${latest.weight_kg} kg` : '-'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">BMI</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white text-sm">{latest?.bmi || '-'}</p>
            {bmiCat && <span className={bmiCat.cls}>{bmiCat.label}</span>}
          </div>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Lemak Tubuh</p>
          <p className="font-semibold text-white text-sm">{latest?.body_fat_percentage ? `${latest.body_fat_percentage}%` : '-'}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Perkembangan Berat Badan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
              />
              <Line type="monotone" dataKey="berat" name="Berat (kg)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              <Line type="monotone" dataKey="otot" name="Otot (kg)" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="lemak" name="Lemak (%)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to={`/clients/${id}/bodyin`} className="card hover:border-emerald-600/50 transition-colors flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 rounded-lg"><Scale className="w-5 h-5 text-emerald-400" /></div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Input Data BodyIn</p>
            <p className="text-xs text-gray-500">Catat hasil pengukuran mesin</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Link>
        <Link to={`/workout?client=${id}`} className="card hover:border-blue-600/50 transition-colors flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg"><Dumbbell className="w-5 h-5 text-blue-400" /></div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Program Workout</p>
            <p className="text-xs text-gray-500">Lihat rutinitas minggu ini</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Link>
        <Link to={`/diet?client=${id}`} className="card hover:border-orange-600/50 transition-colors flex items-center gap-3 sm:col-span-2">
          <div className="p-2 bg-orange-600/20 rounded-lg"><Salad className="w-5 h-5 text-orange-400" /></div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Menu Diet</p>
            <p className="text-xs text-gray-500">Rekomendasi makanan sesuai goal</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Link>
      </div>

      {/* Measurement History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Riwayat Pengukuran</h3>
          <Link to={`/clients/${id}/bodyin`} className="btn-primary flex items-center gap-1 text-sm py-1.5">
            <Plus className="w-4 h-4" /> Tambah
          </Link>
        </div>
        {measurements.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Belum ada data pengukuran.</p>
        ) : (
          <div className="space-y-2">
            {[...measurements].reverse().map(m => (
              <div key={m.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {new Date(m.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {m.weight_kg && <span className="text-xs text-gray-400">Berat: <b className="text-gray-200">{m.weight_kg} kg</b></span>}
                    {m.bmi && <span className="text-xs text-gray-400">BMI: <b className="text-gray-200">{m.bmi}</b></span>}
                    {m.body_fat_percentage && <span className="text-xs text-gray-400">Lemak: <b className="text-gray-200">{m.body_fat_percentage}%</b></span>}
                    {m.muscle_mass_kg && <span className="text-xs text-gray-400">Otot: <b className="text-gray-200">{m.muscle_mass_kg} kg</b></span>}
                    {m.visceral_fat && <span className="text-xs text-gray-400">Visc. Fat: <b className="text-gray-200">{m.visceral_fat}</b></span>}
                  </div>
                </div>
                <button onClick={() => deleteMeasurement(m.id)} className="text-gray-600 hover:text-red-400 ml-2 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
