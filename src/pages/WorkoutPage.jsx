import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateWeeklyWorkout } from '../lib/workoutEngine'
import { Dumbbell, ChevronDown, ChevronUp, RefreshCw, User } from 'lucide-react'

const goalLabel = { cut: 'Turun BB (Cut)', bulk: 'Naik BB (Bulk)', maintain: 'Maintenance', toning: 'Toning' }
const dayColors = ['border-l-blue-500', 'border-l-emerald-500', 'border-l-violet-500', 'border-l-orange-500', 'border-l-pink-500', 'border-l-yellow-500', 'border-l-gray-500']

function ExerciseRow({ ex }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-800 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-200">{ex.name}</p>
        {ex.note && <p className="text-xs text-yellow-500 mt-0.5">⚠ {ex.note}</p>}
        <p className="text-xs text-gray-600 mt-0.5">{ex.cat}</p>
      </div>
      <div className="text-right text-xs text-gray-400 ml-4 shrink-0">
        <p><span className="text-gray-200 font-semibold">{ex.sets}</span> set × <span className="text-gray-200 font-semibold">{ex.reps}</span></p>
        <p className="text-gray-600">Rest: {ex.rest}</p>
      </div>
    </div>
  )
}

function DayCard({ dayPlan, index }) {
  const [open, setOpen] = useState(index === 0)
  const color = dayColors[index % dayColors.length]

  return (
    <div className={`card border-l-4 ${color}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div className="text-left">
          <p className="font-semibold text-white">{dayPlan.day}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {dayPlan.rest ? '😴 Istirahat / Recovery' : dayPlan.focus}
            {!dayPlan.rest && <span className="ml-2 text-gray-600">· {dayPlan.exercises?.length} latihan</span>}
          </p>
        </div>
        {!dayPlan.rest && (open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />)}
      </button>

      {!dayPlan.rest && open && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          {dayPlan.exercises.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-3">Tidak ada latihan hari ini.</p>
          ) : (
            dayPlan.exercises.map((ex, i) => <ExerciseRow key={i} ex={ex} />)
          )}
        </div>
      )}

      {dayPlan.rest && open && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-sm text-gray-500">Gunakan hari ini untuk istirahat total atau aktivitas ringan seperti jalan santai, stretching, atau yoga selama 20-30 menit.</p>
        </div>
      )}
    </div>
  )
}

export default function WorkoutPage() {
  const [searchParams] = useSearchParams()
  const clientId = searchParams.get('client')
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(clientId || '')
  const [clientData, setClientData] = useState(null)
  const [workout, setWorkout] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('clients').select('id, name, goal').order('name')
      .then(({ data }) => setClients(data || []))
  }, [])

  useEffect(() => {
    if (selectedClient) loadWorkout(selectedClient)
  }, [selectedClient])

  async function loadWorkout(cid) {
    setLoading(true)
    const { data: client } = await supabase.from('clients').select('*').eq('id', cid).single()
    const { data: measurements } = await supabase.from('bodyin_measurements').select('*')
      .eq('client_id', cid).order('measured_at', { ascending: false }).limit(1)
    const latest = measurements?.[0]
    setClientData({ ...client, latest })
    setWorkout(generateWeeklyWorkout({
      goal: client?.goal || 'maintain',
      bodyFat: latest?.body_fat_percentage,
      muscleMass: latest?.muscle_mass_kg,
      bmi: latest?.bmi,
      gender: client?.gender,
    }))
    setLoading(false)
  }

  function regenerate() {
    if (clientData) {
      setWorkout(generateWeeklyWorkout({
        goal: clientData.goal || 'maintain',
        bodyFat: clientData.latest?.body_fat_percentage,
        muscleMass: clientData.latest?.muscle_mass_kg,
        bmi: clientData.latest?.bmi,
        gender: clientData.gender,
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-blue-400" /> Program Workout
          </h1>
          <p className="text-gray-500 text-sm mt-1">Rutinitas latihan mingguan sesuai data komposisi tubuh</p>
        </div>
        {workout.length > 0 && (
          <button onClick={regenerate} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Regenerasi
          </button>
        )}
      </div>

      {/* Client selector */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Pilih Klien</span>
        </div>
        <select
          className="input"
          value={selectedClient}
          onChange={e => setSelectedClient(e.target.value)}
        >
          <option value="">-- Pilih klien --</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({goalLabel[c.goal] || c.goal})</option>
          ))}
        </select>

        {clientData && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-500">Goal</p>
              <p className="text-sm font-semibold text-white">{goalLabel[clientData.goal] || '-'}</p>
            </div>
            {clientData.latest && (
              <>
                <div>
                  <p className="text-xs text-gray-500">Berat</p>
                  <p className="text-sm font-semibold text-white">{clientData.latest.weight_kg || '-'} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lemak Tubuh</p>
                  <p className="text-sm font-semibold text-white">{clientData.latest.body_fat_percentage || '-'}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">BMI</p>
                  <p className="text-sm font-semibold text-white">{clientData.latest.bmi || '-'}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Workout display */}
      {loading && (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => <div key={i} className="card animate-pulse h-16 bg-gray-800" />)}
        </div>
      )}

      {!loading && workout.length === 0 && !selectedClient && (
        <div className="card text-center py-14">
          <Dumbbell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Pilih klien di atas untuk melihat program workout mingguan</p>
        </div>
      )}

      {!loading && workout.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Program untuk minggu ini</p>
            <span className="text-xs text-gray-600">·</span>
            <p className="text-sm text-emerald-400">
              {workout.filter(d => !d.rest).length} hari latihan
            </p>
          </div>
          <div className="space-y-3">
            {workout.map((day, i) => <DayCard key={day.day} dayPlan={day} index={i} />)}
          </div>

          <div className="card bg-blue-950/30 border-blue-800/50">
            <p className="text-sm font-semibold text-blue-300 mb-2">Tips Latihan</p>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>• Selalu lakukan <span className="text-gray-200">warm-up 5-10 menit</span> sebelum latihan dan <span className="text-gray-200">cool-down</span> setelahnya</li>
              <li>• Minum air putih minimal <span className="text-gray-200">2-3 liter/hari</span>, tambah saat berolahraga intensif</li>
              <li>• Progressif overload: <span className="text-gray-200">tambah beban/reps</span> setiap minggu bila sudah nyaman</li>
              <li>• Tidur <span className="text-gray-200">7-9 jam</span> untuk recovery optimal dan pertumbuhan otot</li>
              <li>• Jika ada nyeri sendi/otot yang tidak wajar, <span className="text-gray-200">istirahat dan konsultasi</span></li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
