import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateWeeklyDiet } from '../lib/dietEngine'
import { Salad, Clock, Flame, Beef, Wheat, Droplets, ChevronDown, ChevronUp, RefreshCw, User } from 'lucide-react'

const goalLabel = { cut: 'Turun BB (Cut)', bulk: 'Naik BB (Bulk)', maintain: 'Maintenance', toning: 'Toning' }

function MacroBadge({ label, value, unit, icon: Icon, color }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-white">{value}{unit}</p>
      </div>
    </div>
  )
}

function MealCard({ meal, mealTime, mealName }) {
  const timeLabel = {
    breakfast: 'Sarapan',
    snack1: 'Snack Pagi',
    lunch: 'Makan Siang',
    snack2: 'Snack Sore',
    dinner: 'Makan Malam',
  }

  return (
    <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700/50">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500">{timeLabel[mealName]} · {meal.time}</p>
          <p className="text-sm font-semibold text-white mt-0.5">{meal.name}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-xs text-gray-500">Kalori</p>
          <p className="text-sm font-bold text-emerald-400">{meal.cal} kcal</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-2">
        <span className="text-xs text-gray-500">P: <span className="text-gray-300">{meal.protein}g</span></span>
        <span className="text-xs text-gray-600">·</span>
        <span className="text-xs text-gray-500">K: <span className="text-gray-300">{meal.carbs}g</span></span>
        <span className="text-xs text-gray-600">·</span>
        <span className="text-xs text-gray-500">L: <span className="text-gray-300">{meal.fat}g</span></span>
        {meal.prep && meal.prep !== '0 menit' && (
          <>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />{meal.prep}
            </span>
          </>
        )}
      </div>

      {meal.ingredients && (
        <div className="flex flex-wrap gap-1">
          {meal.ingredients.map((ing, i) => (
            <span key={i} className="text-xs bg-gray-700/60 text-gray-400 px-2 py-0.5 rounded-full">{ing}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function DayPlan({ dayPlan, index }) {
  const [open, setOpen] = useState(index === 0)
  const borderColors = ['border-l-emerald-500', 'border-l-blue-500', 'border-l-violet-500', 'border-l-orange-500', 'border-l-pink-500', 'border-l-yellow-500', 'border-l-teal-500']
  const border = borderColors[index % borderColors.length]

  const pctDiff = Math.round(((dayPlan.totalCal - dayPlan.calTarget) / dayPlan.calTarget) * 100)
  const calStatus = Math.abs(pctDiff) <= 10 ? 'badge-good' : pctDiff > 10 ? 'badge-bad' : 'badge-warn'

  return (
    <div className={`card border-l-4 ${border}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between cursor-pointer">
        <div className="text-left">
          <p className="font-semibold text-white">{dayPlan.day}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-400">
              <span className="text-white font-semibold">{dayPlan.totalCal}</span> kcal
              <span className="text-gray-600"> / target {dayPlan.calTarget} kcal</span>
            </span>
            <span className={calStatus}>{pctDiff >= 0 ? '+' : ''}{pctDiff}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="text-right text-xs text-gray-500 hidden sm:block">
            <p>P: {dayPlan.totalProtein}g · K: {dayPlan.totalCarbs}g · L: {dayPlan.totalFat}g</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3 pt-4 border-t border-gray-800">
          {/* Macro summary */}
          <div className="grid grid-cols-4 gap-2">
            <MacroBadge label="Kalori" value={dayPlan.totalCal} unit=" kkal" icon={Flame} color="text-orange-400" />
            <MacroBadge label="Protein" value={dayPlan.totalProtein} unit="g" icon={Beef} color="text-red-400" />
            <MacroBadge label="Karbo" value={dayPlan.totalCarbs} unit="g" icon={Wheat} color="text-yellow-400" />
            <MacroBadge label="Lemak" value={dayPlan.totalFat} unit="g" icon={Droplets} color="text-blue-400" />
          </div>

          {/* Meals */}
          <div className="space-y-2.5">
            {Object.entries(dayPlan.meals).map(([mealName, meal]) => (
              <MealCard key={mealName} meal={meal} mealTime={meal.time} mealName={mealName} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DietPage() {
  const [searchParams] = useSearchParams()
  const clientId = searchParams.get('client')
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(clientId || '')
  const [clientData, setClientData] = useState(null)
  const [diet, setDiet] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('clients').select('id, name, goal').order('name')
      .then(({ data }) => setClients(data || []))
  }, [])

  useEffect(() => {
    if (selectedClient) loadDiet(selectedClient)
  }, [selectedClient])

  async function loadDiet(cid) {
    setLoading(true)
    const { data: client } = await supabase.from('clients').select('*').eq('id', cid).single()
    const { data: measurements } = await supabase.from('bodyin_measurements').select('*')
      .eq('client_id', cid).order('measured_at', { ascending: false }).limit(1)
    const latest = measurements?.[0]
    setClientData({ ...client, latest })
    setDiet(generateWeeklyDiet({
      goal: client?.goal || 'maintain',
      bmr: latest?.bmr_kcal || 1600,
      bodyFat: latest?.body_fat_percentage,
      gender: client?.gender,
    }))
    setLoading(false)
  }

  function regenerate() {
    if (clientData) {
      setDiet(generateWeeklyDiet({
        goal: clientData.goal || 'maintain',
        bmr: clientData.latest?.bmr_kcal || 1600,
        bodyFat: clientData.latest?.body_fat_percentage,
        gender: clientData.gender,
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Salad className="w-6 h-6 text-emerald-400" /> Menu Diet Mingguan
          </h1>
          <p className="text-gray-500 text-sm mt-1">Rekomendasi makanan mudah dimasak sesuai goal & data tubuh</p>
        </div>
        {diet.length > 0 && (
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
                  <p className="text-xs text-gray-500">BMR</p>
                  <p className="text-sm font-semibold text-white">{clientData.latest.bmr_kcal ? `${clientData.latest.bmr_kcal} kcal` : 'Belum diukur'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Berat</p>
                  <p className="text-sm font-semibold text-white">{clientData.latest.weight_kg || '-'} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lemak Tubuh</p>
                  <p className="text-sm font-semibold text-white">{clientData.latest.body_fat_percentage || '-'}%</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Diet display */}
      {loading && (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => <div key={i} className="card animate-pulse h-16 bg-gray-800" />)}
        </div>
      )}

      {!loading && diet.length === 0 && !selectedClient && (
        <div className="card text-center py-14">
          <Salad className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Pilih klien di atas untuk melihat rencana makan mingguan</p>
        </div>
      )}

      {!loading && diet.length > 0 && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-gray-500">Rencana makan 7 hari</p>
            <span className="text-xs text-gray-600">·</span>
            <p className="text-sm text-emerald-400">Target ~{diet[0]?.calTarget} kcal/hari</p>
          </div>

          <div className="space-y-3">
            {diet.map((day, i) => <DayPlan key={day.day} dayPlan={day} index={i} />)}
          </div>

          <div className="card bg-emerald-950/30 border-emerald-800/50">
            <p className="text-sm font-semibold text-emerald-300 mb-2">Tips Nutrisi</p>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>• Makan dalam porsi kecil tapi <span className="text-gray-200">5x/hari</span> untuk menjaga metabolisme stabil</li>
              <li>• Konsumsi protein di setiap waktu makan untuk <span className="text-gray-200">menjaga massa otot</span></li>
              <li>• Minum air putih <span className="text-gray-200">30 menit sebelum makan</span> untuk mengontrol nafsu makan</li>
              <li>• Hindari makanan ultra-processed, gorengan berlebih, dan minuman bergula</li>
              <li>• Persiapan meal prep di <span className="text-gray-200">Minggu sore</span> untuk efisiensi masak minggu ini</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
