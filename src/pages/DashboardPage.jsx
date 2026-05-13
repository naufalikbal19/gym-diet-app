import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Users, TrendingUp, Scale, Activity, ChevronRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalClients: 0, measurementsThisMonth: 0, avgBmi: 0, avgBodyFat: 0 })
  const [recentClients, setRecentClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [{ count: totalClients }, { data: measurements }, { data: recent }] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('bodyin_measurements').select('bmi, body_fat_percentage').gte('measured_at', firstDay),
        supabase.from('clients').select('id, name, gender, goal').order('created_at', { ascending: false }).limit(5),
      ])

      const avgBmi = measurements?.length
        ? (measurements.reduce((s, m) => s + (m.bmi || 0), 0) / measurements.length).toFixed(1)
        : '-'
      const avgFat = measurements?.length
        ? (measurements.reduce((s, m) => s + (m.body_fat_percentage || 0), 0) / measurements.length).toFixed(1)
        : '-'

      setStats({
        totalClients: totalClients || 0,
        measurementsThisMonth: measurements?.length || 0,
        avgBmi,
        avgBodyFat: avgFat,
      })
      setRecentClients(recent || [])
      setLoading(false)
    }
    load()
  }, [])

  const goalLabel = { cut: 'Turun BB', bulk: 'Naik BB', maintain: 'Maintenance', toning: 'Toning' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas gym & diet klien</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Klien" value={stats.totalClients} color="bg-blue-600" />
          <StatCard icon={Activity} label="Pengukuran Bulan Ini" value={stats.measurementsThisMonth} color="bg-emerald-600" />
          <StatCard icon={Scale} label="Rata-rata BMI" value={stats.avgBmi} color="bg-violet-600" sub="bulan ini" />
          <StatCard icon={TrendingUp} label="Rata-rata Lemak" value={stats.avgBodyFat !== '-' ? `${stats.avgBodyFat}%` : '-'} color="bg-orange-600" sub="bulan ini" />
        </div>
      )}

      {/* Recent Clients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Klien Terbaru</h2>
          <Link to="/clients" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Lihat semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {recentClients.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Belum ada klien. <Link to="/clients" className="text-emerald-400">Tambah klien</Link></p>
        ) : (
          <div className="space-y-2">
            {recentClients.map(c => (
              <Link
                key={c.id}
                to={`/clients/${c.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-600/20 border border-emerald-600/30 rounded-full flex items-center justify-center text-emerald-400 font-semibold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.goal && (
                    <span className="badge-good text-xs">{goalLabel[c.goal] || c.goal}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/clients" className="card hover:border-emerald-600/50 transition-colors text-center py-6 group">
          <Users className="w-8 h-8 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-white text-sm">Kelola Klien</p>
          <p className="text-gray-500 text-xs mt-1">Tambah & lihat data klien</p>
        </Link>
        <Link to="/workout" className="card hover:border-blue-600/50 transition-colors text-center py-6 group">
          <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-white text-sm">Program Workout</p>
          <p className="text-gray-500 text-xs mt-1">Lihat rutinitas latihan</p>
        </Link>
        <Link to="/diet" className="card hover:border-orange-600/50 transition-colors text-center py-6 group">
          <Scale className="w-8 h-8 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-white text-sm">Menu Diet</p>
          <p className="text-gray-500 text-xs mt-1">Rekomendasi makanan sehat</p>
        </Link>
      </div>
    </div>
  )
}
